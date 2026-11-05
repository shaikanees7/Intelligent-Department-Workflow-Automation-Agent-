const db = require('../../database/db');

class ApprovalWorkflow {
  static async getSteps(requestType) {
    const [rows] = await db.query(
      `SELECT s.* FROM approval_steps s
       JOIN approval_workflows w ON s.workflow_id = w.workflow_id
       WHERE w.request_type = ? AND w.is_active = TRUE
       ORDER BY s.step_order ASC`,
      [requestType]
    );
    return rows;
  }
}

module.exports = ApprovalWorkflow;
