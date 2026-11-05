const db = require('../../database/db');
const ApiResponse = require('../utils/apiResponse');
const Notification = require('../models/Notification');
const WorkflowEngine = require('../services/workflowEngine.service');

/**
 * University Offices Management & Dashboard Controller
 */
const listOffices = async (req, res, next) => {
  try {
    const [offices] = await db.query(`
      SELECT o.*,
             COUNT(DISTINCT aoa.assignment_id) AS total_assigned_requests,
             SUM(CASE WHEN aoa.status = 'PENDING' THEN 1 ELSE 0 END) AS pending_requests_count,
             SUM(CASE WHEN aoa.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_requests_count,
             (SELECT COUNT(*) FROM office_staff WHERE office_id = o.office_id) AS staff_count
      FROM university_offices o
      LEFT JOIN application_office_assignments aoa ON o.office_id = aoa.office_id
      GROUP BY o.office_id
      ORDER BY o.is_active DESC, o.name ASC
    `);

    const formatted = offices.map((o) => ({
      ...o,
      is_active: Boolean(o.is_active),
      supported_permission_types: typeof o.supported_permission_types === 'string'
        ? JSON.parse(o.supported_permission_types || '[]')
        : (o.supported_permission_types || [])
    }));

    return ApiResponse.success(res, 'University offices retrieved successfully', formatted);
  } catch (err) {
    next(err);
  }
};

const getOfficeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM university_offices WHERE office_id = ? OR code = ?', [id, id]);
    if (!rows.length) return ApiResponse.error(res, 'University office not found.', null, 404);

    const office = rows[0];

    // Fetch staff
    const [staff] = await db.query(
      `SELECT os.*, u.first_name, u.last_name, u.email, u.phone, u.role
       FROM office_staff os
       JOIN users u ON os.user_id = u.user_id
       WHERE os.office_id = ?`,
      [office.office_id]
    );

    // Fetch recent applications
    const [applications] = await db.query(
      `SELECT aoa.*, 
              r.request_code, r.request_type, r.reason, r.start_date, r.end_date, r.is_urgent, r.overall_status,
              CONCAT(u.first_name, ' ', u.last_name) AS student_name,
              u.email AS student_email,
              u.phone AS student_phone,
              u.phone,
              s.registration_number, s.section,
              d.name AS department_name,
              acl.permission_category, acl.confidence AS ai_confidence, acl.reason AS ai_reason
       FROM application_office_assignments aoa
       JOIN permission_requests r ON aoa.request_id = r.request_id
       JOIN users u ON r.student_user_id = u.user_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN ai_classification_logs acl ON r.request_id = acl.request_id
       WHERE aoa.office_id = ?
       ORDER BY r.is_urgent DESC, aoa.assigned_at DESC
       LIMIT 50`,
      [office.office_id]
    );

    return ApiResponse.success(res, 'Office details retrieved', {
      office: {
        ...office,
        is_active: Boolean(office.is_active),
        supported_permission_types: typeof office.supported_permission_types === 'string'
          ? JSON.parse(office.supported_permission_types || '[]')
          : (office.supported_permission_types || [])
      },
      staff,
      applications
    });
  } catch (err) {
    next(err);
  }
};

const createOffice = async (req, res, next) => {
  try {
    const {
      name,
      code,
      category,
      description,
      responsible_officer,
      contact_email,
      contact_phone,
      location,
      supported_permission_types,
      admin_user_id
    } = req.body;

    if (!name || !code || !responsible_officer || !contact_email || !location) {
      return ApiResponse.error(
        res,
        'Missing required fields: name, code, responsible_officer, contact_email, location',
        null,
        400
      );
    }

    const typesJson = Array.isArray(supported_permission_types)
      ? JSON.stringify(supported_permission_types)
      : typeof supported_permission_types === 'string'
      ? JSON.stringify(supported_permission_types.split(',').map((s) => s.trim()))
      : JSON.stringify(['General Office Permission']);

    const [result] = await db.query(
      `INSERT INTO university_offices 
       (name, code, category, description, responsible_officer, contact_email, contact_phone, location, supported_permission_types, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        name,
        code.toUpperCase().replace(/\s+/g, '_'),
        category || 'Administrative',
        description || '',
        responsible_officer,
        contact_email,
        contact_phone || null,
        location,
        typesJson
      ]
    );

    const newOfficeId = result.insertId;

    if (admin_user_id) {
      await db.query(
        `INSERT INTO office_staff (office_id, user_id, designation, is_primary_admin)
         VALUES (?, ?, ?, TRUE)`,
        [newOfficeId, admin_user_id, responsible_officer]
      );
    }

    return ApiResponse.success(
      res,
      'University office registered successfully',
      { office_id: newOfficeId, name, code },
      201
    );
  } catch (err) {
    next(err);
  }
};

const updateOffice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      responsible_officer,
      contact_email,
      contact_phone,
      location,
      supported_permission_types,
      is_active
    } = req.body;

    let typesJson = undefined;
    if (supported_permission_types !== undefined) {
      typesJson = Array.isArray(supported_permission_types)
        ? JSON.stringify(supported_permission_types)
        : typeof supported_permission_types === 'string'
        ? JSON.stringify(supported_permission_types.split(',').map((s) => s.trim()))
        : JSON.stringify([]);
    }

    await db.query(
      `UPDATE university_offices 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           description = COALESCE(?, description),
           responsible_officer = COALESCE(?, responsible_officer),
           contact_email = COALESCE(?, contact_email),
           contact_phone = COALESCE(?, contact_phone),
           location = COALESCE(?, location),
           supported_permission_types = COALESCE(?, supported_permission_types),
           is_active = COALESCE(?, is_active)
       WHERE office_id = ?`,
      [
        name,
        category,
        description,
        responsible_officer,
        contact_email,
        contact_phone,
        location,
        typesJson,
        is_active,
        id
      ]
    );

    return ApiResponse.success(res, 'University office updated successfully');
  } catch (err) {
    next(err);
  }
};

const getOfficeApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    let query = `
      SELECT aoa.*, 
             r.request_code, r.request_type, r.reason, r.start_date, r.end_date, r.is_urgent, r.overall_status,
             CONCAT(u.first_name, ' ', u.last_name) AS student_name,
             u.email AS student_email,
             u.phone AS student_phone,
             u.phone,
             s.registration_number, s.section,
             d.name AS department_name,
             acl.permission_category, acl.confidence AS ai_confidence, acl.reason AS ai_reason,
             acl.requires_clarification
      FROM application_office_assignments aoa
      JOIN permission_requests r ON aoa.request_id = r.request_id
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN ai_classification_logs acl ON r.request_id = acl.request_id
      WHERE aoa.office_id = ?
    `;

    const params = [id];
    if (status && status !== 'ALL') {
      query += ' AND aoa.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.is_urgent DESC, aoa.assigned_at DESC';

    const [rows] = await db.query(query, params);
    return ApiResponse.success(res, 'Office applications retrieved', rows);
  } catch (err) {
    next(err);
  }
};

const officeAction = async (req, res, next) => {
  try {
    const { id } = req.params; // office_id
    const { assignment_id, request_id, action, remarks, target_office_id } = req.body;
    const reviewerUserId = req.user.userId;

    if (!action) {
      return ApiResponse.error(res, 'Action is required (ACCEPT, FORWARD, APPROVE, REJECT)', null, 400);
    }

    const normAction = action.toUpperCase();

    if (normAction === 'ACCEPT') {
      await db.query(
        `UPDATE application_office_assignments 
         SET status = 'ACCEPTED', action_taken_by = ?, remarks = ?, updated_at = NOW() 
         WHERE assignment_id = ? OR (request_id = ? AND office_id = ?)`,
        [reviewerUserId, remarks || 'Application accepted for office review.', assignment_id, request_id, id]
      );
      return ApiResponse.success(res, 'Application accepted by office for verification.');
    }

    if (normAction === 'FORWARD') {
      if (!target_office_id) {
        return ApiResponse.error(res, 'target_office_id is required to forward application.', null, 400);
      }

      // Mark current assignment as FORWARDED
      await db.query(
        `UPDATE application_office_assignments 
         SET status = 'FORWARDED', action_taken_by = ?, remarks = ?, updated_at = NOW() 
         WHERE assignment_id = ? OR (request_id = ? AND office_id = ?)`,
        [reviewerUserId, remarks || `Forwarded to another university office.`, assignment_id, request_id, id]
      );

      // Create new assignment in target office
      await db.query(
        `INSERT INTO application_office_assignments (request_id, office_id, assigned_by, status, remarks)
         VALUES (?, ?, 'OFFICE_FORWARD', 'PENDING', ?)`,
        [request_id, target_office_id, `Forwarded from office ${id}. Remarks: ${remarks || 'None'}`]
      );

      return ApiResponse.success(res, 'Application successfully forwarded to designated office.');
    }

    if (normAction === 'APPROVE' || normAction === 'REJECT') {
      // Execute through WorkflowEngine
      const wfAction = normAction === 'REJECT' ? 'REJECTED' : 'APPROVED';
      const result = await WorkflowEngine.advanceStep(request_id, reviewerUserId, wfAction, remarks);

      await db.query(
        `UPDATE application_office_assignments 
         SET status = ?, action_taken_by = ?, remarks = ?, updated_at = NOW() 
         WHERE assignment_id = ? OR (request_id = ? AND office_id = ?)`,
        [normAction === 'REJECT' ? 'REJECTED' : 'PROCESSED', reviewerUserId, remarks, assignment_id, request_id, id]
      );

      return ApiResponse.success(res, `Office review '${normAction}' completed.`, result);
    }

    return ApiResponse.error(res, `Unknown office action: ${action}`, null, 400);
  } catch (err) {
    next(err);
  }
};

const getOfficeStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [counts] = await db.query(
      `SELECT 
         COUNT(*) AS total_routed,
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_count,
         SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_count,
         SUM(CASE WHEN status = 'PROCESSED' THEN 1 ELSE 0 END) AS processed_count,
         SUM(CASE WHEN status = 'FORWARDED' THEN 1 ELSE 0 END) AS forwarded_count,
         SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count
       FROM application_office_assignments 
       WHERE office_id = ?`,
      [id]
    );

    return ApiResponse.success(res, 'Office statistics fetched', counts[0] || {});
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  getOfficeApplications,
  officeAction,
  getOfficeStats
};
