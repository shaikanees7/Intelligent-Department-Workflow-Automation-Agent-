const db = require('../../database/db');
const ApiResponse = require('../utils/apiResponse');

const getDashboardStats = async (req, res, next) => {
  try {
    const [counts] = await db.query(`
      SELECT 
        COUNT(*) AS total_requests,
        SUM(CASE WHEN overall_status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN overall_status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW') THEN 1 ELSE 0 END) AS pending_count
      FROM permission_requests
    `);
    return ApiResponse.success(res, 'Statistics fetched', counts[0]);
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, email, first_name, last_name, role, department_id, is_active FROM users ORDER BY created_at DESC'
    );
    return ApiResponse.success(res, 'Users fetched', users);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, listUsers };
