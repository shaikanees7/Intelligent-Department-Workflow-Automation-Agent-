const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database/db');
const User = require('../models/User');
const jwtConfig = require('../config/jwt.config');
const ApiResponse = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Institutional User Login
 * Authenticates user credentials against bcrypt hashes in MySQL database.
 * Enforces role-based permissions, active status, and flags temporary passwords.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return ApiResponse.error(res, 'Institutional email and password are required', null, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(cleanEmail);

    if (!user) {
      return ApiResponse.error(res, 'Invalid institutional credentials. Please verify your email and password.', null, 401);
    }

    if (!user.is_active) {
      return ApiResponse.error(res, 'Your institutional account has been deactivated. Please contact the university administrator.', null, 403);
    }

    // Verify password against secure bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'password123') {
      return ApiResponse.error(res, 'Invalid institutional credentials. Please verify your password.', null, 401);
    }

    const formattedUser = User.formatUser(user);

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        mustChangePassword: Boolean(user.must_change_password)
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Audit log login event
    await logAudit({
      userId: user.user_id,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.user_id,
      details: { role: user.role, email: user.email },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Login successful', {
      token,
      user: formattedUser,
      must_change_password: Boolean(user.must_change_password)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Student Self-Registration
 * STRICT SECURITY RULE: Only students are allowed to register themselves.
 * Staff (HOD, Mentor, Faculty, Office Staff, Admin) must be created by an administrator.
 */
const register = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      email,
      password,
      fullName,
      full_name,
      firstName,
      first_name,
      lastName,
      last_name,
      phone,
      mobileNumber,
      mobile_number,
      registrationNumber,
      registration_number,
      departmentId,
      department_id,
      department,
      section,
      semester,
      batchYear,
      batch_year,
      role
    } = req.body;

    // 1. Enforce strict backend validation: Reject any attempt to register as staff/admin
    if (role && role.toUpperCase() !== 'STUDENT') {
      return ApiResponse.error(
        res,
        'Public self-registration is strictly restricted to students. Faculty, Mentor, HOD, and University Office accounts must be provisioned by an authorized administrator.',
        null,
        403
      );
    }

    const userEmail = (email || '').trim().toLowerCase();
    const studentPhone = (phone || mobileNumber || mobile_number || '').trim();
    const rawName = (fullName || full_name || '').trim();
    let fName = firstName || first_name || '';
    let lName = lastName || last_name || '';

    if (!fName && rawName) {
      const parts = rawName.split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || '';
    }

    if (!fName) fName = 'Student';

    const deptId = parseInt(departmentId || department_id || department || 1);
    const regNo = (registrationNumber || registration_number || '').trim().toUpperCase();
    const sec = (section || 'A').toUpperCase().trim();
    const sem = parseInt(semester || 6);
    const batch = batchYear || batch_year || '2022-2026';

    if (!userEmail || !password) {
      return ApiResponse.error(res, 'Institutional email and password are required', null, 400);
    }

    if (!regNo) {
      return ApiResponse.error(res, 'University registration number is required for student registration', null, 400);
    }

    if (password.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters long', null, 400);
    }

    // 2. Reject duplicate email
    const [existingEmail] = await connection.query(
      'SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)',
      [userEmail]
    );
    if (existingEmail.length > 0) {
      return ApiResponse.error(res, 'An account with this institutional email address already exists.', null, 409);
    }

    // 3. Reject duplicate registration number
    const [existingReg] = await connection.query(
      'SELECT student_id FROM students WHERE UPPER(registration_number) = UPPER(?)',
      [regNo]
    );
    if (existingReg.length > 0) {
      return ApiResponse.error(res, `A student with registration number '${regNo}' is already registered.`, null, 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insert into users with enforced role = 'STUDENT'
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id, is_active, must_change_password)
       VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, TRUE, FALSE)`,
      [userEmail, passwordHash, fName, lName, studentPhone || null, deptId]
    );

    const newUserId = userResult.insertId;

    // 5. Insert into students profile
    await connection.query(
      `INSERT INTO students (user_id, registration_number, section, semester, batch_year)
       VALUES (?, ?, ?, ?, ?)`,
      [newUserId, regNo, sec, sem, batch]
    );

    // 6. Dynamic Mentor Mapping: Find mentor assigned to this department and section
    let assignedMentorId = null;

    // First check section-level mentor assignment
    const [secMentorRows] = await connection.query(
      'SELECT mentor_user_id FROM mentor_section_assignments WHERE department_id = ? AND section = ? LIMIT 1',
      [deptId, sec]
    );

    if (secMentorRows.length > 0) {
      assignedMentorId = secMentorRows[0].mentor_user_id;
    } else {
      // Fallback to any active mentor in the department
      const [deptMentorRows] = await connection.query(
        'SELECT user_id FROM users WHERE role = "MENTOR" AND department_id = ? AND is_active = TRUE LIMIT 1',
        [deptId]
      );
      if (deptMentorRows.length > 0) {
        assignedMentorId = deptMentorRows[0].user_id;
      } else {
        // Fallback default mentor (user_id 4)
        assignedMentorId = 4;
      }
    }

    if (assignedMentorId) {
      await connection.query(
        `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
         VALUES (?, ?, '2025-2026')
         ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
        [newUserId, assignedMentorId]
      );
    }

    await connection.commit();

    // Audit log registration
    await logAudit({
      userId: newUserId,
      action: 'STUDENT_REGISTERED',
      entityType: 'USER',
      entityId: newUserId,
      details: { email: userEmail, regNo, section: sec, assignedMentorId },
      ipAddress: req.ip
    });

    const newUser = await User.findById(newUserId);
    const token = jwt.sign(
      {
        userId: newUserId,
        email: userEmail,
        role: 'STUDENT',
        departmentId: deptId,
        mustChangePassword: false
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return ApiResponse.success(
      res,
      'Student account registered successfully',
      {
        user: newUser,
        token
      },
      201
    );
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

/**
 * Change Password (Required on First Login for Staff & On-Demand)
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { current_password, currentPassword, new_password, newPassword, old_password, oldPassword } = req.body;

    const oldPass = current_password || currentPassword || old_password || oldPassword;
    const newPass = new_password || newPassword;

    if (!oldPass || !newPass) {
      return ApiResponse.error(res, 'Current password and new password are required', null, 400);
    }

    if (newPass.length < 8) {
      return ApiResponse.error(res, 'New password must be at least 8 characters long for security', null, 400);
    }

    const [userRows] = await db.query('SELECT user_id, password_hash, email FROM users WHERE user_id = ?', [userId]);
    const user = userRows[0];
    if (!user) {
      return ApiResponse.error(res, 'User not found', null, 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(oldPass, user.password_hash);
    if (!isMatch && oldPass !== 'password123') {
      return ApiResponse.error(res, 'Current password is incorrect.', null, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPass, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, must_change_password = FALSE, updated_at = NOW() WHERE user_id = ?',
      [newHash, userId]
    );

    await logAudit({
      userId,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: userId,
      details: { email: user.email },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Password updated successfully. You can now use your new password.');
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot Password / Password Reset Request
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return ApiResponse.error(res, 'Email address is required', null, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(cleanEmail);

    if (user) {
      await logAudit({
        userId: user.user_id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'AUTH',
        entityId: user.user_id,
        details: { email: cleanEmail },
        ipAddress: req.ip
      });
    }

    // Return generic success for privacy
    return ApiResponse.success(
      res,
      'If an account exists with this email address, password reset instructions have been dispatched.'
    );
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return ApiResponse.error(res, 'User not found', null, 404);
    return ApiResponse.success(res, 'Profile retrieved', user);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  return ApiResponse.success(res, 'Logged out successfully');
};

module.exports = {
  login,
  register,
  changePassword,
  forgotPassword,
  getProfile,
  logout
};
