const db = require('../../database/db');
const { generatePermissionPdf } = require('./pdfGenerator.service');
const { sendNotificationEmail } = require('./email.service');
const Notification = require('../models/Notification');

/**
 * Intelligent Workflow Automation Engine:
 * Handles sequential multi-level transitions, routing, audit logging,
 * decision enforcement, PDF issuance, and status alerts.
 */
class WorkflowEngine {
  static async advanceStep(requestId, reviewerUserId, action, remarks) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch current request state
      const [requests] = await connection.query('SELECT * FROM permission_requests WHERE request_id = ? FOR UPDATE', [requestId]);
      const reqData = requests[0];
      if (!reqData) throw new Error('Request not found');

      // 2. Fetch workflow sequence for request type
      const [steps] = await connection.query(
        `SELECT s.* FROM approval_steps s
         JOIN approval_workflows w ON s.workflow_id = w.workflow_id
         WHERE w.request_type = ? AND w.is_active = TRUE
         ORDER BY s.step_order ASC`,
        [reqData.request_type]
      );

      // Log to Audit Trail
      await connection.query(
        `INSERT INTO approval_history (request_id, step_order, reviewer_user_id, action, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [requestId, reqData.current_step_order, reviewerUserId, action, remarks]
      );

      if (action === 'REJECTED') {
        // Immediate termination
        await connection.query(
          `UPDATE permission_requests SET overall_status = 'REJECTED', updated_at = NOW() WHERE request_id = ?`,
          [requestId]
        );
        await connection.commit();

        // Notify student of rejection
        await Notification.create({
          user_id: reqData.student_user_id,
          request_id: requestId,
          title: 'Permission Request Rejected',
          message: `Your ${reqData.request_type} request (${reqData.request_code}) was rejected. Remarks: ${remarks}`,
          type: 'REJECTION'
        });
        return { status: 'REJECTED' };
      }

      // Check if next step exists
      const currentIdx = steps.findIndex(s => s.step_order === reqData.current_step_order);
      const nextStep = steps[currentIdx + 1];

      if (!nextStep) {
        // Final Approval reached!
        const pdfPath = await generatePermissionPdf(requestId);
        await connection.query(
          `UPDATE permission_requests 
           SET overall_status = 'APPROVED', current_reviewer_role = NULL, current_reviewer_user_id = NULL, pdf_letter_url = ?, updated_at = NOW()
           WHERE request_id = ?`,
          [pdfPath, requestId]
        );
        await connection.commit();

        // Notify Student
        await Notification.create({
          user_id: reqData.student_user_id,
          request_id: requestId,
          title: 'Permission Request Approved!',
          message: `Your ${reqData.request_type} request (${reqData.request_code}) has received final approval. Download your pass now.`,
          type: 'APPROVAL'
        });
        return { status: 'APPROVED', pdfUrl: pdfPath };
      }

      // Route to next authority
      const nextRole = nextStep.required_role;
      let nextReviewerId = null;

      // Automatic Request Routing logic
      if (nextRole === 'HOD') {
        const [hodRows] = await connection.query(
          `SELECT u.user_id FROM users u 
           JOIN students s ON s.user_id = ?
           WHERE u.role = 'HOD' AND u.department_id = (SELECT department_id FROM users WHERE user_id = ?)`,
          [reqData.student_user_id, reqData.student_user_id]
        );
        if (hodRows.length) nextReviewerId = hodRows[0].user_id;
      }

      await connection.query(
        `UPDATE permission_requests 
         SET current_step_order = ?, current_reviewer_role = ?, current_reviewer_user_id = ?, overall_status = 'UNDER_REVIEW', updated_at = NOW()
         WHERE request_id = ?`,
        [nextStep.step_order, nextRole, nextReviewerId, requestId]
      );
      await connection.commit();

      // Notify next reviewer
      if (nextReviewerId) {
        await Notification.create({
          user_id: nextReviewerId,
          request_id: requestId,
          title: 'New Application Assigned for Verification',
          message: `A new ${reqData.request_type} request (${reqData.request_code}) awaits your review.`,
          type: 'ASSIGNMENT'
        });
      }

      return { status: 'FORWARDED', nextRole, nextStepOrder: nextStep.step_order };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = WorkflowEngine;
