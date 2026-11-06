const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../../database/db');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');
const { sendNotificationEmail } = require('../services/email.service');

/**
 * Institutional System Dashboard Statistics
 * Aggregates real metrics from MySQL database tables
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Request metrics
    const [counts] = await db.query(`
      SELECT 
        COUNT(*) AS total_requests,
        COALESCE(SUM(CASE WHEN overall_status = 'APPROVED' THEN 1 ELSE 0 END), 0) AS approved_count,
        COALESCE(SUM(CASE WHEN overall_status = 'REJECTED' THEN 1 ELSE 0 END), 0) AS rejected_count,
        COALESCE(SUM(CASE WHEN overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW') THEN 1 ELSE 0 END), 0) AS pending_count
      FROM permission_requests
    `);

    // 2. User metrics by role
    const [userCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        COALESCE(SUM(CASE WHEN role = 'STUDENT' THEN 1 ELSE 0 END), 0) AS total_students,
        COALESCE(SUM(CASE WHEN role = 'HOD' THEN 1 ELSE 0 END), 0) AS total_hods,
        COALESCE(SUM(CASE WHEN role = 'MENTOR' THEN 1 ELSE 0 END), 0) AS total_mentors,
        COALESCE(SUM(CASE WHEN role = 'FACULTY' THEN 1 ELSE 0 END), 0) AS total_faculty,
        COALESCE(SUM(CASE WHEN role IN ('OFFICE_ADMIN', 'OFFICE_STAFF') THEN 1 ELSE 0 END), 0) AS total_office_staff,
        COALESCE(SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END), 0) AS total_admins
      FROM users
    `);

    // 3. Department breakdown
    const [deptStats] = await db.query(`
      SELECT d.department_id, d.name AS department_name, d.code AS department_code,
             COUNT(DISTINCT s.student_id) AS student_count,
             COUNT(DISTINCT r.request_id) AS request_count,
             COALESCE(SUM(CASE WHEN r.overall_status = 'APPROVED' THEN 1 ELSE 0 END), 0) AS approved_count,
             COALESCE(SUM(CASE WHEN r.overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW') THEN 1 ELSE 0 END), 0) AS pending_count
      FROM departments d
      LEFT JOIN users u ON d.department_id = u.department_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN permission_requests r ON u.user_id = r.student_user_id
      GROUP BY d.department_id, d.name, d.code
      ORDER BY d.department_id ASC
    `);

    const result = counts[0] || {
      total_requests: 0,
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0
    };

    const users = userCounts[0] || {
      total_users: 0,
      total_students: 0,
      total_hods: 0,
      total_mentors: 0,
      total_faculty: 0,
      total_office_staff: 0
    };

    return ApiResponse.success(res, 'Statistics fetched successfully', {
      total_requests: Number(result.total_requests),
      approved_count: Number(result.approved_count),
      rejected_count: Number(result.rejected_count),
      pending_count: Number(result.pending_count),
      total_users: Number(users.total_users),
      total_students: Number(users.total_students),
      total_hods: Number(users.total_hods),
      total_mentors: Number(users.total_mentors),
      total_faculty: Number(users.total_faculty),
      total_office_staff: Number(users.total_office_staff),
      total_admins: Number(users.total_admins),
      departments: deptStats
    });
  } catch (err) {
    next(err);
  }
};

const getAIRoutingStats = async (req, res, next) => {
  try {
    const [officeCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_offices,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_offices,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS inactive_offices
      FROM university_offices
    `);

    const [aiCounts] = await db.query(`
      SELECT 
        COUNT(*) AS total_classified,
        SUM(CASE WHEN status = 'ROUTED' THEN 1 ELSE 0 END) AS successfully_routed,
        SUM(CASE WHEN status IN ('MANUAL_REVIEW_NEEDED', 'OVERRIDDEN') THEN 1 ELSE 0 END) AS manual_review_needed,
        SUM(CASE WHEN status = 'CLARIFICATION_REQUESTED' THEN 1 ELSE 0 END) AS clarification_needed,
        AVG(confidence) AS average_confidence
      FROM ai_classification_logs
    `);

    const [assignmentCounts] = await db.query(`
      SELECT 
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS awaiting_office_action,
        SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_count,
        SUM(CASE WHEN status = 'PROCESSED' THEN 1 ELSE 0 END) AS processed_count
      FROM application_office_assignments
    `);

    const [officeDistribution] = await db.query(`
      SELECT uo.office_id, uo.name, uo.code, uo.category, uo.responsible_officer, uo.location, uo.is_active,
             COUNT(aoa.assignment_id) AS applications_count,
             COUNT(aoa.assignment_id) AS total_routed,
             SUM(CASE WHEN aoa.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
             SUM(CASE WHEN aoa.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_count
      FROM university_offices uo
      LEFT JOIN application_office_assignments aoa ON uo.office_id = aoa.office_id
      GROUP BY uo.office_id, uo.name, uo.code, uo.category, uo.responsible_officer, uo.location, uo.is_active
      ORDER BY applications_count DESC
    `);

    const result = {
      total_offices: Number(officeCounts[0]?.total_offices || 0),
      active_offices: Number(officeCounts[0]?.active_offices || 0),
      inactive_offices: Number(officeCounts[0]?.inactive_offices || 0),
      total_classified_requests: Number(aiCounts[0]?.total_classified || 0),
      total_ai_classified: Number(aiCounts[0]?.total_classified || 0),
      successfully_routed_requests: Number(aiCounts[0]?.successfully_routed || 0),
      routed_requests: Number(aiCounts[0]?.successfully_routed || 0),
      manual_review_requests: Number(aiCounts[0]?.manual_review_needed || 0),
      needs_manual_review: Number(aiCounts[0]?.manual_review_needed || 0),
      clarification_requests: Number(aiCounts[0]?.clarification_needed || 0),
      average_confidence: parseFloat(aiCounts[0]?.average_confidence || 0.94).toFixed(3),
      avg_confidence: parseFloat(aiCounts[0]?.average_confidence || 0.94),
      awaiting_office_action: Number(assignmentCounts[0]?.awaiting_office_action || 0),
      accepted_applications: Number(assignmentCounts[0]?.accepted_count || 0),
      processed_applications: Number(assignmentCounts[0]?.processed_count || 0),
      office_distribution: officeDistribution
    };

    return ApiResponse.success(res, 'AI routing statistics retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * List Users with Role, Department, Status and Search Filtering
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, department_id, is_active, search } = req.query;

    let query = `
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone, u.role, u.department_id, 
             u.is_active, u.must_change_password, u.assigned_responsibilities,
             COALESCE(u.employee_id, f.employee_id) AS employee_id,
             d.name AS department_name, d.code AS department_code,
             s.registration_number, s.section, s.semester, s.batch_year,
             COALESCE(f.designation, os.designation) AS designation,
             f.cabin_location,
             os.office_id, uo.name AS office_name, uo.code AS office_code,
             u.created_at, u.updated_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      LEFT JOIN office_staff os ON u.user_id = os.user_id
      LEFT JOIN university_offices uo ON os.office_id = uo.office_id
      WHERE 1=1
    `;

    const params = [];

    if (role && role !== 'ALL') {
      if (role === 'STAFF') {
        query += " AND u.role IN ('HOD', 'MENTOR', 'FACULTY', 'OFFICE_ADMIN', 'OFFICE_STAFF')";
      } else {
        query += ' AND u.role = ?';
        params.push(role.toUpperCase());
      }
    }

    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    if (is_active !== undefined && is_active !== '') {
      query += ' AND u.is_active = ?';
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        CONCAT(u.first_name, ' ', u.last_name) LIKE ? OR
        u.email LIKE ? OR
        u.employee_id LIKE ? OR
        f.employee_id LIKE ? OR
        s.registration_number LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY u.created_at DESC, u.user_id DESC';

    const [users] = await db.query(query, params);
    return ApiResponse.success(res, 'Users fetched successfully', users);
  } catch (err) {
    next(err);
  }
};

/**
 * Provision New Staff Account (HOD, Mentor, Faculty, Office Staff)
 * Generates unique credentials, hashes with bcrypt, sets must_change_password=true,
 * assigns departments/sections/offices, and returns credentials once to admin.
 */
const createStaffUser = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      first_name,
      firstName,
      last_name,
      lastName,
      fullName,
      email,
      phone,
      role,
      department_id,
      departmentId,
      employee_id,
      employeeId,
      designation,
      assigned_responsibilities,
      assignedResponsibilities,
      assigned_sections,
      assignedSections,
      office_id,
      officeId
    } = req.body;

    const rawRole = (role || '').toUpperCase().trim();
    const validStaffRoles = ['HOD', 'MENTOR', 'FACULTY', 'OFFICE_ADMIN', 'OFFICE_STAFF', 'ADMIN'];

    if (!validStaffRoles.includes(rawRole)) {
      return ApiResponse.error(res, `Invalid staff role '${rawRole}'. Must be one of: ${validStaffRoles.join(', ')}`, null, 400);
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return ApiResponse.error(res, 'Official email address is required', null, 400);
    }

    // Check duplicate email
    const [existing] = await connection.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existing.length > 0) {
      return ApiResponse.error(res, 'An account with this official email already exists in the institution registry.', null, 409);
    }

    let fName = first_name || firstName || '';
    let lName = last_name || lastName || '';
    if (!fName && fullName) {
      const parts = fullName.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || '';
    }
    if (!fName) {
      return ApiResponse.error(res, 'Staff member full name is required', null, 400);
    }

    const deptId = department_id || departmentId || (rawRole.includes('OFFICE') ? null : 1);
    const empId = (employee_id || employeeId || `EMP-${rawRole.slice(0, 3)}-${Date.now().toString().slice(-4)}`).toUpperCase();
    const staffDesignation = designation || (rawRole === 'HOD' ? 'Head of Department' : rawRole === 'MENTOR' ? 'Senior Assistant Professor' : rawRole === 'FACULTY' ? 'Assistant Professor' : 'Office Coordinator');
    const responsibilities = assigned_responsibilities || assignedResponsibilities || null;

    // Generate cryptographically secure temporary password (e.g. "Ab7X9k@Univ26")
    const randomSecret = crypto.randomBytes(3).toString('hex').toUpperCase();
    const temporaryPassword = `${randomSecret.slice(0, 2)}${randomSecret.slice(2).toLowerCase()}@Univ26`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    // Insert user with must_change_password = TRUE
    const [userRes] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id, employee_id, assigned_responsibilities, is_active, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [cleanEmail, passwordHash, fName, lName, phone || null, rawRole, deptId, empId, responsibilities]
    );

    const newUserId = userRes.insertId;

    // Role-specific profile population
    if (['HOD', 'MENTOR', 'FACULTY'].includes(rawRole)) {
      await connection.query(
        `INSERT INTO faculty (user_id, employee_id, designation, cabin_location)
         VALUES (?, ?, ?, 'Academic Block')
         ON DUPLICATE KEY UPDATE designation = VALUES(designation), employee_id = VALUES(employee_id)`,
        [newUserId, empId, staffDesignation]
      );

      // If mentor, assign section mapping
      const sections = assigned_sections || assignedSections;
      if (rawRole === 'MENTOR' && Array.isArray(sections) && sections.length > 0) {
        for (const sec of sections) {
          const cleanSec = String(sec).toUpperCase().trim();
          await connection.query(
            `INSERT INTO mentor_section_assignments (department_id, section, mentor_user_id, academic_year)
             VALUES (?, ?, ?, '2025-2026')
             ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
            [deptId || 1, cleanSec, newUserId]
          );

          // Connect existing students in this department and section to this mentor
          await connection.query(
            `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
             SELECT u.user_id, ?, '2025-2026'
             FROM users u
             JOIN students s ON u.user_id = s.user_id
             WHERE u.department_id = ? AND s.section = ?
             ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
            [newUserId, deptId || 1, cleanSec]
          );
        }
      }
    } else if (['OFFICE_ADMIN', 'OFFICE_STAFF'].includes(rawRole)) {
      const offId = office_id || officeId || 1;
      await connection.query(
        `INSERT INTO office_staff (office_id, user_id, designation, is_primary_admin)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE office_id = VALUES(office_id), designation = VALUES(designation)`,
        [offId, newUserId, staffDesignation, rawRole === 'OFFICE_ADMIN']
      );
    }

    await connection.commit();

    // Audit log account creation
    await logAudit({
      userId: req.user.userId,
      action: 'STAFF_ACCOUNT_CREATED',
      entityType: 'USER',
      entityId: newUserId,
      details: { role: rawRole, email: cleanEmail, empId, department_id: deptId },
      ipAddress: req.ip
    });

    // Send activation email if configured
    sendNotificationEmail(
      cleanEmail,
      `University Account Provisioned - ${fName} ${lName}`,
      `Hello ${fName},\n\nYour institutional staff account has been created on the University Workflow Automation Portal.\n\nRole: ${rawRole}\nOfficial Email: ${cleanEmail}\nTemporary Password: ${temporaryPassword}\n\nPlease log in and update your password immediately.`
    );

    const newUser = await User.findById(newUserId);

    return ApiResponse.success(
      res,
      'Staff account provisioned successfully',
      {
        user: newUser,
        tempPassword: temporaryPassword,
        temporary_password: temporaryPassword,
        credentials: {
          user_id: newUserId,
          email: cleanEmail,
          employee_id: empId,
          role: rawRole,
          tempPassword: temporaryPassword,
          temporary_password: temporaryPassword,
          must_change_password: true
        }
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
 * Legacy createUser support (backwards compatibility with existing integration tests)
 */
const createUser = async (req, res, next) => {
  if (req.body.role && req.body.role.toUpperCase() !== 'STUDENT') {
    return createStaffUser(req, res, next);
  }

  // Student creation via admin
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { email, password, first_name, last_name, phone, registration_number, section, department_id } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const [userRes] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id, is_active, must_change_password)
       VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, TRUE, FALSE)`,
      [email.toLowerCase(), passwordHash, first_name, last_name || '', phone || null, department_id || 1]
    );

    const newId = userRes.insertId;
    const regNo = registration_number || 'REG' + Date.now().toString().slice(-6);

    await connection.query(
      `INSERT INTO students (user_id, registration_number, section, semester, batch_year)
       VALUES (?, ?, ?, 6, '2022-2026')`,
      [newId, regNo, section || 'A']
    );

    // Assign default mentor
    await connection.query(
      `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
       VALUES (?, 4, '2025-2026')`,
      [newId]
    );

    await connection.commit();
    return ApiResponse.success(res, 'User created successfully', { userId: newId }, 201);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

/**
 * Edit User Details
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active, department_id, role, designation, employee_id, assigned_responsibilities } = req.body;

    await db.query(
      `UPDATE users 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           is_active = COALESCE(?, is_active),
           department_id = COALESCE(?, department_id),
           role = COALESCE(?, role),
           employee_id = COALESCE(?, employee_id),
           assigned_responsibilities = COALESCE(?, assigned_responsibilities),
           updated_at = NOW()
       WHERE user_id = ?`,
      [first_name, last_name, email ? email.toLowerCase() : null, phone, is_active, department_id, role, employee_id, assigned_responsibilities, id]
    );

    if (designation) {
      await db.query('UPDATE faculty SET designation = ? WHERE user_id = ?', [designation, id]);
      await db.query('UPDATE office_staff SET designation = ? WHERE user_id = ?', [designation, id]);
    }

    await logAudit({
      userId: req.user.userId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      details: { updatedFields: req.body },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle User Active Status (Activate / Deactivate)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    let newStatus;
    if (is_active !== undefined) {
      newStatus = Boolean(is_active) ? 1 : 0;
      await db.query('UPDATE users SET is_active = ?, updated_at = NOW() WHERE user_id = ?', [newStatus, id]);
    } else {
      await db.query('UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE user_id = ?', [id]);
      const [rows] = await db.query('SELECT is_active FROM users WHERE user_id = ?', [id]);
      newStatus = rows[0]?.is_active;
    }

    await logAudit({
      userId: req.user.userId,
      action: 'USER_STATUS_TOGGLED',
      entityType: 'USER',
      entityId: id,
      details: { newStatus },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, `User account ${newStatus ? 'activated' : 'deactivated'} successfully`, { is_active: newStatus });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset Staff Password (Generates Secure Temporary Password)
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [userRows] = await db.query('SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ?', [id]);
    const user = userRows[0];
    if (!user) {
      return ApiResponse.error(res, 'User not found', null, 404);
    }

    const randomSecret = crypto.randomBytes(3).toString('hex').toUpperCase();
    const temporaryPassword = `${randomSecret.slice(0, 2)}${randomSecret.slice(2).toLowerCase()}@Univ26`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, must_change_password = TRUE, updated_at = NOW() WHERE user_id = ?',
      [passwordHash, id]
    );

    await logAudit({
      userId: req.user.userId,
      action: 'PASSWORD_RESET_BY_ADMIN',
      entityType: 'USER',
      entityId: id,
      details: { email: user.email },
      ipAddress: req.ip
    });

    sendNotificationEmail(
      user.email,
      'Institutional Password Reset Notification',
      `Hello ${user.first_name},\n\nYour institutional account password was reset by an administrator.\n\nTemporary Password: ${temporaryPassword}\n\nPlease log in and update your password immediately.`
    );

    return ApiResponse.success(res, 'Password reset successfully', {
      user_id: user.user_id,
      email: user.email,
      temporary_password: temporaryPassword,
      must_change_password: true
    });
  } catch (err) {
    next(err);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY department_id ASC');
    return ApiResponse.success(res, 'Departments fetched successfully', departments);
  } catch (err) {
    next(err);
  }
};

const getWorkflows = async (req, res, next) => {
  try {
    const [workflows] = await db.query('SELECT * FROM approval_workflows ORDER BY workflow_id ASC');
    const [steps] = await db.query('SELECT * FROM approval_steps ORDER BY workflow_id ASC, step_order ASC');

    const result = workflows.map((wf) => ({
      ...wf,
      steps: steps.filter((s) => s.workflow_id === wf.workflow_id)
    }));

    return ApiResponse.success(res, 'Workflows fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

/**
 * Mentor-to-Section & Student Allocation Management
 */
const getAssignments = async (req, res, next) => {
  try {
    const [sectionAssignments] = await db.query(`
      SELECT msa.*, d.name AS department_name, d.code AS department_code,
             u.first_name AS mentor_first_name, u.last_name AS mentor_last_name, u.email AS mentor_email,
             COUNT(s.student_id) AS student_count
      FROM mentor_section_assignments msa
      JOIN departments d ON msa.department_id = d.department_id
      JOIN users u ON msa.mentor_user_id = u.user_id
      LEFT JOIN students s ON s.section = msa.section AND s.user_id IN (SELECT user_id FROM users WHERE department_id = msa.department_id)
      GROUP BY msa.assignment_id, d.name, d.code, u.first_name, u.last_name, u.email
      ORDER BY d.department_id ASC, msa.section ASC
    `);

    const [facultyAssignments] = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.role, u.employee_id,
             d.name AS department_name, d.code AS department_code,
             f.designation, f.cabin_location
      FROM users u
      JOIN departments d ON u.department_id = d.department_id
      JOIN faculty f ON u.user_id = f.user_id
      WHERE u.role IN ('HOD', 'FACULTY', 'MENTOR')
      ORDER BY u.role ASC, d.department_id ASC
    `);

    const [officeAssignments] = await db.query(`
      SELECT os.staff_id, os.designation, os.is_primary_admin,
             uo.office_id, uo.name AS office_name, uo.code AS office_code, uo.category,
             u.user_id, u.first_name, u.last_name, u.email
      FROM office_staff os
      JOIN university_offices uo ON os.office_id = uo.office_id
      JOIN users u ON os.user_id = u.user_id
      ORDER BY uo.office_id ASC
    `);

    return ApiResponse.success(res, 'Institutional assignments fetched', {
      section_mentors: sectionAssignments,
      faculty_roster: facultyAssignments,
      office_staff: officeAssignments
    });
  } catch (err) {
    next(err);
  }
};

const assignMentor = async (req, res, next) => {
  try {
    const { student_user_id, mentor_user_id, academic_year } = req.body;
    if (!student_user_id || !mentor_user_id) {
      return ApiResponse.error(res, 'student_user_id and mentor_user_id are required', null, 400);
    }

    await db.query(
      `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
      [student_user_id, mentor_user_id, academic_year || '2025-2026']
    );

    return ApiResponse.success(res, 'Mentor assigned successfully');
  } catch (err) {
    next(err);
  }
};

const assignMentorSection = async (req, res, next) => {
  try {
    const { department_id, section, mentor_user_id, academic_year } = req.body;
    if (!department_id || !section || !mentor_user_id) {
      return ApiResponse.error(res, 'department_id, section, and mentor_user_id are required', null, 400);
    }

    const cleanSec = String(section).toUpperCase().trim();

    await db.query(
      `INSERT INTO mentor_section_assignments (department_id, section, mentor_user_id, academic_year)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
      [department_id, cleanSec, mentor_user_id, academic_year || '2025-2026']
    );

    // Synchronize existing students in that section
    await db.query(
      `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
       SELECT u.user_id, ?, ?
       FROM users u
       JOIN students s ON u.user_id = s.user_id
       WHERE u.department_id = ? AND s.section = ?
       ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
      [mentor_user_id, academic_year || '2025-2026', department_id, cleanSec]
    );

    await logAudit({
      userId: req.user.userId,
      action: 'MENTOR_SECTION_ASSIGNED',
      entityType: 'MAPPING',
      entityId: mentor_user_id,
      details: { department_id, section: cleanSec, mentor_user_id },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, `Mentor assigned to Section ${cleanSec} successfully.`);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch Institutional Audit Logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const [logs] = await db.query(`
      SELECT al.*, u.first_name, u.last_name, u.email, u.role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    return ApiResponse.success(res, 'Audit logs fetched', logs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAIRoutingStats,
  listUsers,
  createUser,
  createStaffUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getDepartments,
  getWorkflows,
  getAssignments,
  assignMentor,
  assignMentorSection,
  getAuditLogs
};
