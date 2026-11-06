const db = require('../../database/db');
const PermissionRequest = require('../models/PermissionRequest');
const PriorityEngine = require('../services/priorityEngine.service');
const WorkflowEngine = require('../services/workflowEngine.service');
const GeminiRoutingService = require('../services/geminiRouting.service');
const PermissionIntentService = require('../services/permissionIntent.service');
const Notification = require('../models/Notification');
const { sendNotificationEmail } = require('../services/email.service');
const { logAudit } = require('../utils/auditLogger');
const ApiResponse = require('../utils/apiResponse');

/**
 * Validates permission intent pre-submission or on-demand
 */
const validatePermissionIntent = async (req, res, next) => {
  try {
    const { subject, reason, request_type, start_date, end_date } = req.body;
    const validation = await PermissionIntentService.validateIntent({
      subject,
      reason,
      request_type,
      start_date,
      end_date
    });

    return res.status(200).json({
      success: true,
      data: validation
    });
  } catch (err) {
    next(err);
  }
};

const submitRequest = async (req, res, next) => {
  try {
    const { request_type, subject, reason, start_date, end_date, registration_number, phone, mobile_number } = req.body;
    const studentUserId = req.user.userId;

    // Server-side Intent Validation: Ensure request has legitimate university purpose
    const intentValidation = await PermissionIntentService.validateIntent({
      subject: subject || '',
      reason: reason || '',
      request_type: request_type || 'OD',
      start_date,
      end_date
    });

    if (!intentValidation.valid) {
      return res.status(422).json({
        success: false,
        message: intentValidation.message,
        validation: intentValidation
      });
    }

    // Persist/Update phone & registration number if supplied
    const studentPhone = (phone || mobile_number || '').trim();
    if (studentPhone) {
      await db.query('UPDATE users SET phone = ? WHERE user_id = ?', [studentPhone, studentUserId]);
    }

    const regNo = (registration_number || '').trim();
    if (regNo) {
      await db.query(
        'INSERT INTO students (user_id, registration_number, section, semester, batch_year) VALUES (?, ?, "A", 6, "2022-2026") ON DUPLICATE KEY UPDATE registration_number = ?',
        [studentUserId, regNo, regNo]
      );
    }

    // 1. Fetch student's profile & department info
    const [studentProfileRows] = await db.query(
      `SELECT u.department_id, s.section, d.name AS department_name
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE u.user_id = ?`,
      [studentUserId]
    );

    const studentDeptId = studentProfileRows[0]?.department_id || 1;
    const studentSection = studentProfileRows[0]?.section || 'A';
    const deptName = studentProfileRows[0]?.department_name || 'Engineering';

    // 2. Dynamic Mentor Resolution (Hierarchy: Individual -> Section -> Department -> System)
    let assignedMentorId = null;

    // A. Check student-specific mentor assignment
    const [mentorRows] = await db.query(
      'SELECT mentor_user_id FROM mentor_assignments WHERE student_user_id = ?',
      [studentUserId]
    );
    if (mentorRows.length && mentorRows[0].mentor_user_id) {
      assignedMentorId = mentorRows[0].mentor_user_id;
    }

    // B. Check section-level mentor assignment
    if (!assignedMentorId) {
      const [secMentorRows] = await db.query(
        'SELECT mentor_user_id FROM mentor_section_assignments WHERE department_id = ? AND section = ?',
        [studentDeptId, studentSection]
      );
      if (secMentorRows.length && secMentorRows[0].mentor_user_id) {
        assignedMentorId = secMentorRows[0].mentor_user_id;
      }
    }

    // C. Check active department mentor
    if (!assignedMentorId) {
      const [deptMentorRows] = await db.query(
        'SELECT user_id FROM users WHERE role = "MENTOR" AND department_id = ? AND is_active = TRUE LIMIT 1',
        [studentDeptId]
      );
      if (deptMentorRows.length) {
        assignedMentorId = deptMentorRows[0].user_id;
      }
    }

    // D. Fallback to any active mentor in system
    if (!assignedMentorId) {
      const [fallbackMentor] = await db.query(
        'SELECT user_id FROM users WHERE role = "MENTOR" AND is_active = TRUE LIMIT 1'
      );
      if (fallbackMentor.length) {
        assignedMentorId = fallbackMentor[0].user_id;
      }
    }

    if (!assignedMentorId) {
      return ApiResponse.error(
        res,
        `Workflow Routing Error: No active academic mentor is currently assigned to ${deptName}, Section '${studentSection}'. Please contact your university administrator.`,
        null,
        400
      );
    }

    // Synchronize assignment for this student
    await db.query(
      `INSERT INTO mentor_assignments (student_user_id, mentor_user_id, academic_year)
       VALUES (?, ?, '2025-2026')
       ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)`,
      [studentUserId, assignedMentorId]
    );

    // Priority Assessment
    const { isUrgent } = PriorityEngine.assessPriority(start_date, request_type);
    const requestCode = 'REQ-' + Math.floor(100000 + Math.random() * 900000);

    const requestId = await PermissionRequest.create({
      request_code: requestCode,
      student_user_id: studentUserId,
      request_type: (request_type || 'OD').toUpperCase(),
      reason,
      start_date,
      end_date,
      is_urgent: isUrgent ? 1 : 0,
      current_step_order: 1,
      current_reviewer_role: 'MENTOR',
      current_reviewer_user_id: assignedMentorId
    });

    // Handle document upload if present
    if (req.file) {
      await db.query(
        'INSERT INTO uploaded_documents (request_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
        [requestId, req.file.originalname, `/uploads/${req.file.filename}`, req.file.mimetype, req.file.size]
      );
    }

    // Trigger Gemini AI Classification & Dynamic Office Routing
    const routingPayload = {
      request_id: requestId,
      request_code: requestCode,
      request_type,
      reason,
      start_date,
      end_date,
      student_user_id: studentUserId
    };

    // Run classification (await so immediate AI feedback is generated, catch internally for safe fallback)
    try {
      await GeminiRoutingService.classifyAndRoute(requestId, routingPayload);
    } catch (aiErr) {
      console.warn('[Gemini Routing Background Warning]:', aiErr.message);
    }

    // In-app Notification for student
    await Notification.create({
      user_id: studentUserId,
      request_id: requestId,
      title: `Application Submitted (${requestCode})`,
      message: `Your permission application has been analyzed by AI and routed for departmental & office processing.`,
      type: 'SUBMISSION'
    });

    // In-app Notification for Mentor
    if (assignedMentorId) {
      await Notification.create({
        user_id: assignedMentorId,
        request_id: requestId,
        title: `Mentee Verification Pending (${requestCode})`,
        message: `Student application is awaiting your academic verification.`,
        type: 'ASSIGNMENT'
      });
    }

    // Send confirmation email to student
    const [studentRows] = await db.query('SELECT email, first_name FROM users WHERE user_id = ?', [studentUserId]);
    if (studentRows.length && studentRows[0].email) {
      sendNotificationEmail(
        studentRows[0].email,
        `Application Submitted: ${requestCode}`,
        `Hello ${studentRows[0].first_name},\n\nYour permission request (${requestCode}) has been received and routed for approval.`
      );
    }

    // Audit Log
    await logAudit({
      userId: studentUserId,
      action: 'REQUEST_SUBMITTED',
      entityType: 'REQUEST',
      entityId: requestId,
      details: { requestCode, request_type, assignedMentorId },
      ipAddress: req.ip
    });

    return ApiResponse.success(
      res,
      'Permission request submitted successfully',
      {
        requestId,
        requestCode,
        request_id: requestId,
        request_code: requestCode
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, 
              u.first_name AS reviewer_first_name, 
              u.last_name AS reviewer_last_name,
              uo.name AS routed_office_name,
              uo.code AS routed_office_code,
              aoa.status AS office_assignment_status,
              acl.permission_category AS ai_category,
              acl.confidence AS ai_confidence,
              acl.requires_clarification AS ai_needs_clarification
       FROM permission_requests r
       LEFT JOIN users u ON r.current_reviewer_user_id = u.user_id
       LEFT JOIN application_office_assignments aoa ON r.request_id = aoa.request_id
       LEFT JOIN university_offices uo ON aoa.office_id = uo.office_id
       LEFT JOIN ai_classification_logs acl ON r.request_id = acl.request_id
       WHERE r.student_user_id = ? 
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );

    return ApiResponse.success(res, 'Requests fetched', rows);
  } catch (err) {
    next(err);
  }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.userId;

    let query = `
      SELECT r.*, 
             CONCAT(u.first_name, ' ', u.last_name) AS student_name,
             u.email AS student_email,
             u.phone AS student_phone,
             u.phone,
             s.registration_number,
             s.section,
             s.semester,
             d.name AS department,
             '88%' AS attendance,
             uo.name AS routed_office_name,
             acl.permission_category AS ai_category,
             acl.confidence AS ai_confidence,
             acl.reason AS ai_reason,
             (SELECT remarks FROM approval_history WHERE request_id = r.request_id AND action = 'VERIFIED' ORDER BY action_timestamp DESC LIMIT 1) AS mentor_remarks,
             (SELECT remarks FROM approval_history WHERE request_id = r.request_id AND action = 'APPROVED' ORDER BY action_timestamp DESC LIMIT 1) AS faculty_remarks
      FROM permission_requests r
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN application_office_assignments aoa ON r.request_id = aoa.request_id
      LEFT JOIN university_offices uo ON aoa.office_id = uo.office_id
      LEFT JOIN ai_classification_logs acl ON r.request_id = acl.request_id
      WHERE r.overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW')
    `;

    const params = [];

    if (userRole === 'MENTOR') {
      // Mentors see ONLY applications assigned to them directly or from their mentored sections
      query += ` AND r.current_reviewer_role = 'MENTOR' AND (
        r.current_reviewer_user_id = ?
        OR r.student_user_id IN (SELECT student_user_id FROM mentor_assignments WHERE mentor_user_id = ?)
        OR (s.section IN (SELECT section FROM mentor_section_assignments WHERE mentor_user_id = ?) AND u.department_id IN (SELECT department_id FROM mentor_section_assignments WHERE mentor_user_id = ?))
      )`;
      params.push(userId, userId, userId, userId);
    } else if (userRole === 'FACULTY') {
      // Faculty members see applications in their department at Step 2
      const [facUser] = await db.query('SELECT department_id FROM users WHERE user_id = ?', [userId]);
      const facDeptId = facUser[0]?.department_id || 1;
      query += ' AND r.current_step_order >= 2 AND (r.current_reviewer_role = "FACULTY" OR r.current_reviewer_user_id = ?) AND u.department_id = ?';
      params.push(userId, facDeptId);
    } else if (userRole === 'HOD') {
      // HODs see applications in their department at final step
      const [hodUser] = await db.query('SELECT department_id FROM users WHERE user_id = ?', [userId]);
      const hodDeptId = hodUser[0]?.department_id || 1;
      query += ' AND r.current_step_order >= 3 AND u.department_id = ?';
      params.push(hodDeptId);
    } else if (userRole === 'OFFICE_ADMIN' || userRole === 'OFFICE_STAFF') {
      // Office Staff see applications routed to their assigned university office
      query += ` AND (
        aoa.office_id IN (SELECT office_id FROM office_staff WHERE user_id = ?)
        OR r.current_reviewer_user_id = ?
      )`;
      params.push(userId, userId);
    }

    query += ' ORDER BY r.is_urgent DESC, r.created_at DESC';

    const [rows] = await db.query(query, params);
    return ApiResponse.success(res, 'Pending requests fetched', rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch Mentees Assigned to Logged-In Mentor
 */
const getAssignedMentees = async (req, res, next) => {
  try {
    const mentorUserId = req.user.userId;

    const [mentees] = await db.query(`
      SELECT DISTINCT 
        s.student_id, 
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.registration_number,
        s.section,
        s.semester,
        s.batch_year,
        d.name AS department_name,
        '88%' AS attendance,
        (SELECT COUNT(*) FROM permission_requests WHERE student_user_id = u.user_id AND overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW')) AS active_requests_count,
        (SELECT COUNT(*) FROM permission_requests WHERE student_user_id = u.user_id AND overall_status = 'APPROVED') AS approved_requests_count
      FROM users u
      JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN mentor_assignments ma ON u.user_id = ma.student_user_id
      LEFT JOIN mentor_section_assignments msa ON msa.department_id = u.department_id AND msa.section = s.section
      WHERE ma.mentor_user_id = ? OR msa.mentor_user_id = ?
      ORDER BY s.registration_number ASC
    `, [mentorUserId, mentorUserId]);

    return ApiResponse.success(res, 'Assigned mentees fetched successfully', mentees);
  } catch (err) {
    next(err);
  }
};

const getRequestTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [reqRows] = await db.query(
      `SELECT r.*, 
              CONCAT(u.first_name, ' ', u.last_name) AS student_name,
              u.email AS student_email,
              u.phone AS student_phone,
              u.phone,
              s.registration_number,
              s.section,
              d.name AS department_name
       FROM permission_requests r
       JOIN users u ON r.student_user_id = u.user_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE r.request_id = ? OR r.request_code = ?`,
      [id, id]
    );

    if (!reqRows.length) {
      return ApiResponse.error(res, 'Request not found', null, 404);
    }

    const currentReq = reqRows[0];

    // Ownership & Access Enforcement: Students can only view their own requests
    if (req.user.role === 'STUDENT' && currentReq.student_user_id !== req.user.userId) {
      return ApiResponse.error(res, 'Access denied. You can only track your own permission applications.', null, 403);
    }

    const [historyRows] = await db.query(
      `SELECT h.*, 
              u.first_name, 
              u.last_name, 
              u.role
       FROM approval_history h
       JOIN users u ON h.reviewer_user_id = u.user_id
       WHERE h.request_id = ? 
       ORDER BY h.action_timestamp ASC`,
      [currentReq.request_id]
    );

    // AI routing information
    const [aiLogs] = await db.query(
      `SELECT * FROM ai_classification_logs WHERE request_id = ? ORDER BY log_id DESC LIMIT 1`,
      [currentReq.request_id]
    );

    const [assignedOffice] = await db.query(
      `SELECT aoa.*, uo.name AS office_name, uo.code AS office_code, uo.responsible_officer, uo.location
       FROM application_office_assignments aoa
       JOIN university_offices uo ON aoa.office_id = uo.office_id
       WHERE aoa.request_id = ?`,
      [currentReq.request_id]
    );

    if (assignedOffice.length) {
      currentReq.assigned_office = assignedOffice[0];
      currentReq.routed_office_name = assignedOffice[0].office_name;
      currentReq.routed_office_code = assignedOffice[0].office_code;
      currentReq.routed_responsible_officer = assignedOffice[0].responsible_officer;
      currentReq.routed_office_location = assignedOffice[0].location;
    }

    const [clarifications] = await db.query(
      `SELECT * FROM clarification_history WHERE request_id = ? ORDER BY clarification_id ASC`,
      [currentReq.request_id]
    );

    return ApiResponse.success(res, 'Tracking details', {
      request: currentReq,
      history: historyRows,
      ai_routing: aiLogs[0] || null,
      assigned_office: assignedOffice[0] || null,
      clarifications: clarifications || []
    });
  } catch (err) {
    next(err);
  }
};

const getAIRoutingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [logs] = await db.query(
      `SELECT * FROM ai_classification_logs WHERE request_id = ? ORDER BY log_id DESC LIMIT 1`,
      [id]
    );

    const [officeAssignments] = await db.query(
      `SELECT aoa.*, uo.name AS office_name, uo.code AS office_code, uo.responsible_officer, uo.contact_email, uo.location
       FROM application_office_assignments aoa
       JOIN university_offices uo ON aoa.office_id = uo.office_id
       WHERE aoa.request_id = ?`,
      [id]
    );

    const [clarifications] = await db.query(
      `SELECT * FROM clarification_history WHERE request_id = ? ORDER BY clarification_id ASC`,
      [id]
    );

    return ApiResponse.success(res, 'AI routing details retrieved', {
      classification: logs[0] || null,
      office_assignment: officeAssignments[0] || null,
      clarification_history: clarifications
    });
  } catch (err) {
    next(err);
  }
};

const submitClarification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reply = req.body.reply || req.body.response_text;
    const studentUserId = req.user.userId;

    if (!reply || !reply.trim()) {
      return ApiResponse.error(res, 'Clarification reply cannot be empty.', null, 400);
    }

    const result = await GeminiRoutingService.submitClarification(id, studentUserId, reply);
    return ApiResponse.success(res, 'Clarification processed and request re-routed by AI.', result);
  } catch (err) {
    next(err);
  }
};

const manualRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const office_id = req.body.office_id || req.body.target_office_id;
    const remarks = req.body.remarks || req.body.reason;
    const adminUserId = req.user.userId;

    if (!office_id) {
      return ApiResponse.error(res, 'office_id is required.', null, 400);
    }

    const result = await GeminiRoutingService.manualRoute(id, office_id, adminUserId, remarks);
    return ApiResponse.success(res, 'Application successfully routed to selected office.', result);
  } catch (err) {
    next(err);
  }
};

const reviewAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const reviewerUserId = req.user.userId;

    if (!action) {
      return ApiResponse.error(res, 'Action is required (APPROVED or REJECTED)', null, 400);
    }

    const normalizedAction = action.toUpperCase() === 'REJECTED' ? 'REJECTED' : 'APPROVED';
    const result = await WorkflowEngine.advanceStep(id, reviewerUserId, normalizedAction, remarks);

    await logAudit({
      userId: reviewerUserId,
      action: `WORKFLOW_ACTION_${normalizedAction}`,
      entityType: 'REQUEST',
      entityId: id,
      details: { action: normalizedAction, remarks, result },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, `Request action '${normalizedAction}' processed successfully.`, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validatePermissionIntent,
  submitRequest,
  getMyRequests,
  getPendingRequests,
  getAssignedMentees,
  getRequestTracking,
  getAIRoutingDetails,
  submitClarification,
  manualRoute,
  reviewAction
};
