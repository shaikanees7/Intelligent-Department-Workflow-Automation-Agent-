const db = require('../../database/db');
const PermissionRequest = require('../models/PermissionRequest');
const PriorityEngine = require('../services/priorityEngine.service');
const WorkflowEngine = require('../services/workflowEngine.service');
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
    const requestCode = 'REQ-' + Date.now().toString().slice(-6);

    const requestId = await PermissionRequest.create({
      request_code: requestCode,
      student_user_id: studentUserId,
      request_type,
      reason,
      start_date,
      end_date,
      is_urgent: isUrgent,
      current_step_order: 1,
      current_reviewer_role: 'MENTOR',
      current_reviewer_user_id: assignedMentorId
    });

    // Handle document upload if present
    if (req.file) {
      await db.query(
        'INSERT INTO uploaded_documents (request_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
        [requestId, req.file.originalname, req.file.path, req.file.mimetype, req.file.size]
      );
    }

    return ApiResponse.success(res, 'Permission request submitted successfully', { requestId, requestCode }, 201);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.first_name AS reviewer_first_name, u.last_name AS reviewer_last_name
       FROM permission_requests r
       LEFT JOIN users u ON r.current_reviewer_user_id = u.user_id
       WHERE r.student_user_id = ? ORDER BY r.created_at DESC`,
      [req.user.userId]
    );
    return ApiResponse.success(res, 'Requests fetched', rows);
  } catch (err) {
    next(err);
  }
};

const getRequestTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [reqRows] = await db.query('SELECT * FROM permission_requests WHERE request_id = ?', [id]);
    if (!reqRows.length) return ApiResponse.error(res, 'Request not found', null, 404);

    const [historyRows] = await db.query(
      `SELECT h.*, u.first_name, u.last_name, u.role
       FROM approval_history h
       JOIN users u ON h.reviewer_user_id = u.user_id
       WHERE h.request_id = ? ORDER BY h.action_timestamp ASC`,
      [id]
    );

    return ApiResponse.success(res, 'Tracking details', {
      request: reqRows[0],
      history: historyRows
    });
  } catch (err) {
    next(err);
  }
};

const reviewAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const reviewerUserId = req.user.userId;

    const result = await WorkflowEngine.advanceStep(id, reviewerUserId, action, remarks);
    return ApiResponse.success(res, `Request action '${action}' processed.`, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRequest, getMyRequests, getRequestTracking, reviewAction };
