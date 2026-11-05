const db = require('../../database/db');

class PermissionRequest {
  static async create(data) {
    const { request_code, student_user_id, request_type, reason, start_date, end_date, is_urgent, current_step_order, current_reviewer_role, current_reviewer_user_id } = data;
    const [result] = await db.query(
      `INSERT INTO permission_requests 
        (request_code, student_user_id, request_type, reason, start_date, end_date, is_urgent, current_step_order, current_reviewer_role, current_reviewer_user_id, overall_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')`,
      [request_code, student_user_id, request_type, reason, start_date, end_date, is_urgent, current_step_order, current_reviewer_role, current_reviewer_user_id]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM permission_requests WHERE request_id = ?', [id]);
    return rows[0];
  }
}

module.exports = PermissionRequest;
