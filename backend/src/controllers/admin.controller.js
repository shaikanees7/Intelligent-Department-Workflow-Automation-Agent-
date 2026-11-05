const bcrypt = require('bcryptjs');
const db = require('../../database/db');
const ApiResponse = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const [counts] = await db.query(`
      SELECT 
        COUNT(*) AS total_requests,
        COALESCE(SUM(CASE WHEN overall_status = 'APPROVED' THEN 1 ELSE 0 END), 0) AS approved_count,
        COALESCE(SUM(CASE WHEN overall_status = 'REJECTED' THEN 1 ELSE 0 END), 0) AS rejected_count,
        COALESCE(SUM(CASE WHEN overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW') THEN 1 ELSE 0 END), 0) AS pending_count
      FROM permission_requests
    `);

    const result = counts[0] || {
      total_requests: 0,
      approved_count: 0,
      rejected_count: 0,
      pending_count: 0
    };

    return ApiResponse.success(res, 'Statistics fetched successfully', {
      total_requests: Number(result.total_requests),
      approved_count: Number(result.approved_count),
      rejected_count: Number(result.rejected_count),
      pending_count: Number(result.pending_count)
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
      SELECT uo.office_id, uo.name, uo.code, uo.category,
             COUNT(aoa.assignment_id) AS applications_count,
             SUM(CASE WHEN aoa.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
             SUM(CASE WHEN aoa.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_count
      FROM university_offices uo
      LEFT JOIN application_office_assignments aoa ON uo.office_id = aoa.office_id
      GROUP BY uo.office_id
      ORDER BY applications_count DESC
    `);

    const result = {
      total_offices: Number(officeCounts[0]?.total_offices || 0),
      active_offices: Number(officeCounts[0]?.active_offices || 0),
      inactive_offices: Number(officeCounts[0]?.inactive_offices || 0),
      total_classified_requests: Number(aiCounts[0]?.total_classified || 0),
      successfully_routed_requests: Number(aiCounts[0]?.successfully_routed || 0),
      manual_review_requests: Number(aiCounts[0]?.manual_review_needed || 0),
      clarification_requests: Number(aiCounts[0]?.clarification_needed || 0),
      average_confidence: parseFloat(aiCounts[0]?.average_confidence || 0.94).toFixed(3),
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

const listUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.role, u.department_id, u.is_active,
             d.name AS department_name, d.code AS department_code,
             s.registration_number, s.section,
             f.designation
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      ORDER BY u.user_id ASC
    `);

    return ApiResponse.success(res, 'Users fetched successfully', users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { email, password, first_name, last_name, role, department_id, phone, registration_number, section, designation } = req.body;

    if (!email || !password || !first_name || !role) {
      return ApiResponse.error(res, 'Missing required fields: email, password, first_name, role', null, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [userRes] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [email.toLowerCase(), passwordHash, first_name, last_name || '', phone || null, role.toUpperCase(), department_id || 1]
    );

    const newId = userRes.insertId;

    if (role.toUpperCase() === 'STUDENT') {
      await connection.query(
        `INSERT INTO students (user_id, registration_number, section, semester, batch_year)
         VALUES (?, ?, ?, 6, '2022-2026')`,
        [newId, registration_number || 'REG' + Date.now().toString().slice(-6), section || 'A']
      );
    } else if (['FACULTY', 'MENTOR', 'HOD'].includes(role.toUpperCase())) {
      await connection.query(
        `INSERT INTO faculty (user_id, employee_id, designation, cabin_location)
         VALUES (?, ?, ?, 'Block A')`,
        [newId, 'EMP_' + Date.now().toString().slice(-6), designation || 'Faculty Member']
      );
    }

    await connection.commit();
    return ApiResponse.success(res, 'User created successfully', { userId: newId }, 201);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, is_active, department_id, role } = req.body;

    await db.query(
      `UPDATE users 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           is_active = COALESCE(?, is_active),
           department_id = COALESCE(?, department_id),
           role = COALESCE(?, role)
       WHERE user_id = ?`,
      [first_name, last_name, is_active, department_id, role, id]
    );

    return ApiResponse.success(res, 'User updated successfully');
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

module.exports = {
  getDashboardStats,
  getAIRoutingStats,
  listUsers,
  createUser,
  updateUser,
  getDepartments,
  getWorkflows,
  assignMentor
};
