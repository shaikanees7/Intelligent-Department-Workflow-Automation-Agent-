const db = require('../../database/db');
const PermissionRequest = require('../models/PermissionRequest');
const PriorityEngine = require('../services/priorityEngine.service');
const WorkflowEngine = require('../services/workflowEngine.service');
const GeminiRoutingService = require('../services/geminiRouting.service');
const Notification = require('../models/Notification');
const { sendNotificationEmail } = require('../services/email.service');
const ApiResponse = require('../utils/apiResponse');

const submitRequest = async (req, res, next) => {
  try {
    const { request_type, reason, start_date, end_date } = req.body;
    const studentUserId = req.user.userId;

    // Check mentor assignment
    const [mentorRows] = await db.query(
      'SELECT mentor_user_id FROM mentor_assignments WHERE student_user_id = ?',
      [studentUserId]
    );
    const assignedMentorId = mentorRows.length ? mentorRows[0].mentor_user_id : null;

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
      query += ' AND (r.current_reviewer_user_id = ? OR r.current_reviewer_role = "MENTOR")';
      params.push(userId);
    } else if (userRole === 'FACULTY') {
      query += ' AND (r.current_reviewer_role = "FACULTY" OR r.current_reviewer_user_id = ?)';
      params.push(userId);
    } else if (userRole === 'HOD') {
      query += ' AND (r.current_reviewer_role = "HOD" OR r.current_reviewer_user_id = ?)';
      params.push(userId);
    }

    query += ' ORDER BY r.is_urgent DESC, r.created_at DESC';

    const [rows] = await db.query(query, params);
    return ApiResponse.success(res, 'Pending requests fetched', rows);
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

    return ApiResponse.success(res, `Request action '${normalizedAction}' processed successfully.`, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRequest,
  getMyRequests,
  getPendingRequests,
  getRequestTracking,
  getAIRoutingDetails,
  submitClarification,
  manualRoute,
  reviewAction
};
