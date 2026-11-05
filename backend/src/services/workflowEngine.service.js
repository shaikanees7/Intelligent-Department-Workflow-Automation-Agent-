const db = require('../../database/db');
const { generatePermissionPdf } = require('./pdfGenerator.service');
const { sendNotificationEmail } = require('./email.service');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Intelligent Workflow Automation Engine:
 * Handles sequential multi-level transitions, automatic routing,
 * audit logging, decision enforcement, PDF generation, and automated alerts.
 */
class WorkflowEngine {
  static async advanceStep(requestId, reviewerUserId, action, remarks = '') {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch current request state with row lock
      const [requests] = await connection.query(
        `SELECT r.*, u.email AS student_email, u.first_name AS student_first_name, u.last_name AS student_last_name,
                u.department_id AS student_dept_id
         FROM permission_requests r
         JOIN users u ON r.student_user_id = u.user_id
         WHERE r.request_id = ? FOR UPDATE`,
        [requestId]
      );

      const reqData = requests[0];
      if (!reqData) {
        throw new Error('Permission request not found.');
      }

      if (reqData.overall_status === 'APPROVED' || reqData.overall_status === 'REJECTED') {
        throw new Error(`Cannot perform action. Request is already finalized as ${reqData.overall_status}.`);
      }

      // Fetch reviewer details
      const [reviewers] = await connection.query('SELECT * FROM users WHERE user_id = ?', [reviewerUserId]);
      const reviewer = reviewers[0];
      if (!reviewer) {
        throw new Error('Reviewer not found.');
      }

      // 2. Fetch workflow sequence for request type
      const [steps] = await connection.query(
        `SELECT s.* FROM approval_steps s
         JOIN approval_workflows w ON s.workflow_id = w.workflow_id
         WHERE w.request_type = ? AND w.is_active = TRUE
         ORDER BY s.step_order ASC`,
        [reqData.request_type]
      );

      if (!steps || steps.length === 0) {
        throw new Error(`No active approval workflow configured for request type '${reqData.request_type}'.`);
      }

      const currentStepObj = steps.find(s => s.step_order === reqData.current_step_order) || steps[0];

      // 3. Log into Approval History (Audit Trail)
      await connection.query(
        `INSERT INTO approval_history (request_id, step_order, reviewer_user_id, action, remarks, action_timestamp)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [requestId, reqData.current_step_order, reviewerUserId, action, remarks || '']
      );

      // --- REJECTION FLOW ---
      if (action === 'REJECTED') {
        await connection.query(
          `UPDATE permission_requests 
           SET overall_status = 'REJECTED', 
               current_reviewer_role = NULL, 
               current_reviewer_user_id = NULL,
               updated_at = NOW() 
           WHERE request_id = ?`,
          [requestId]
        );
        await connection.commit();

        // In-app Notification for student
        await Notification.create({
          user_id: reqData.student_user_id,
          request_id: requestId,
          title: `Request Rejected (${reqData.request_code})`,
          message: `Your ${reqData.request_type} request was rejected by ${reviewer.first_name} ${reviewer.last_name} (${reviewer.role}). Reason: ${remarks || 'No remarks provided.'}`,
          type: 'REJECTION'
        });

        // Email Alert
        sendNotificationEmail(
          reqData.student_email,
          `Workflow Alert: Request ${reqData.request_code} Rejected`,
          `Your ${reqData.request_type} request (${reqData.request_code}) was rejected by ${reviewer.role}. Remarks: ${remarks || 'N/A'}`
        );

        logger.info(`[WorkflowEngine] Request ${reqData.request_code} rejected by user ${reviewerUserId}.`);
        return { status: 'REJECTED', requestId, requestCode: reqData.request_code };
      }

      // --- APPROVAL / VERIFICATION FLOW ---
      const currentIdx = steps.findIndex(s => s.step_order === reqData.current_step_order);
      const nextStep = steps[currentIdx + 1];

      // If no next step, or if approved by assigned University Office Administrator, FINAL SANCTION is reached!
      if (!nextStep || (reviewer.role === 'OFFICE_ADMIN' && action === 'APPROVED')) {
        let pdfPath = null;
        try {
          pdfPath = await generatePermissionPdf(requestId);
        } catch (pdfErr) {
          logger.error(`[WorkflowEngine] PDF generation error: ${pdfErr.message}`);
          pdfPath = `/uploads/permission_letter_${reqData.request_code}.pdf`;
        }

        await connection.query(
          `UPDATE permission_requests 
           SET overall_status = 'APPROVED', 
               current_reviewer_role = NULL, 
               current_reviewer_user_id = NULL, 
               pdf_letter_url = ?, 
               updated_at = NOW()
           WHERE request_id = ?`,
          [pdfPath, requestId]
        );
        await connection.commit();

        // Notify Student
        await Notification.create({
          user_id: reqData.student_user_id,
          request_id: requestId,
          title: `Permission Sanctioned! (${reqData.request_code})`,
          message: `Congratulations! Your ${reqData.request_type} request (${reqData.request_code}) has received final institutional approval. Your digital gate pass is ready to download.`,
          type: 'APPROVAL'
        });

        // Email with PDF download info
        sendNotificationEmail(
          reqData.student_email,
          `Official Permission Sanctioned - ${reqData.request_code}`,
          `Your ${reqData.request_type} request (${reqData.request_code}) has received final sanction. You may now download your pass from the student dashboard.`
        );

        logger.info(`[WorkflowEngine] Request ${reqData.request_code} fully APPROVED. PDF generated at ${pdfPath}.`);
        return {
          status: 'APPROVED',
          requestId,
          requestCode: reqData.request_code,
          pdfUrl: pdfPath
        };
      }

      // Advance to next authority
      const nextRole = nextStep.required_role;
      let effectiveRole = nextRole;
      let nextReviewerId = null;

      if (nextRole === 'MENTOR') {
        const [mentorRows] = await connection.query(
          'SELECT mentor_user_id FROM mentor_assignments WHERE student_user_id = ?',
          [reqData.student_user_id]
        );
        if (mentorRows.length) nextReviewerId = mentorRows[0].mentor_user_id;
      } else if (nextRole === 'FACULTY') {
        const [facRows] = await connection.query(
          'SELECT user_id FROM users WHERE role = "FACULTY" AND department_id = ? AND is_active = TRUE LIMIT 1',
          [reqData.student_dept_id || 1]
        );
        if (facRows.length) nextReviewerId = facRows[0].user_id;
      } else if (nextRole === 'HOD') {
        // Check if an AI or administrator assigned a specific university office to this request
        const [officeRows] = await connection.query(
          `SELECT aoa.office_id, uo.name AS office_name, uo.code AS office_code, os.user_id AS office_staff_id
           FROM application_office_assignments aoa
           JOIN university_offices uo ON aoa.office_id = uo.office_id
           LEFT JOIN office_staff os ON uo.office_id = os.office_id
           WHERE aoa.request_id = ?
           LIMIT 1`,
          [requestId]
        );

        if (officeRows.length && officeRows[0].office_code !== 'DEPT_OFFICE') {
          effectiveRole = officeRows[0].office_code || 'OFFICE_ADMIN';
          if (officeRows[0].office_staff_id) {
            nextReviewerId = officeRows[0].office_staff_id;
          } else {
            const [offUser] = await connection.query(
              'SELECT user_id FROM users WHERE role = "OFFICE_ADMIN" AND is_active = TRUE LIMIT 1'
            );
            if (offUser.length) nextReviewerId = offUser[0].user_id;
          }
        } else {
          const [hodRows] = await connection.query(
            'SELECT user_id FROM users WHERE role = "HOD" AND department_id = ? AND is_active = TRUE LIMIT 1',
            [reqData.student_dept_id || 1]
          );
          if (hodRows.length) nextReviewerId = hodRows[0].user_id;
        }
      } else if (nextRole === 'ADMIN') {
        const [adminRows] = await connection.query(
          'SELECT user_id FROM users WHERE role = "ADMIN" AND is_active = TRUE LIMIT 1'
        );
        if (adminRows.length) nextReviewerId = adminRows[0].user_id;
      }

      await connection.query(
        `UPDATE permission_requests 
         SET current_step_order = ?, 
             current_reviewer_role = ?, 
             current_reviewer_user_id = ?, 
             overall_status = 'UNDER_REVIEW', 
             updated_at = NOW()
         WHERE request_id = ?`,
        [nextStep.step_order, effectiveRole, nextReviewerId, requestId]
      );
      await connection.commit();

      // Notify next reviewer
      if (nextReviewerId) {
        await Notification.create({
          user_id: nextReviewerId,
          request_id: requestId,
          title: `Action Required: ${reqData.request_type} (${reqData.request_code})`,
          message: `Application submitted by ${reqData.student_first_name} ${reqData.student_last_name} awaits your review as ${effectiveRole}.`,
          type: 'ASSIGNMENT'
        });

        // Email next reviewer
        const [nextReviewerRows] = await db.query('SELECT email FROM users WHERE user_id = ?', [nextReviewerId]);
        if (nextReviewerRows.length) {
          sendNotificationEmail(
            nextReviewerRows[0].email,
            `Review Assignment: ${reqData.request_code}`,
            `A permission application (${reqData.request_code}) from student ${reqData.student_first_name} ${reqData.student_last_name} has been forwarded to your desk.`
          );
        }
      }

      // Notify student about stage advance
      await Notification.create({
        user_id: reqData.student_user_id,
        request_id: requestId,
        title: `Workflow Advanced (${reqData.request_code})`,
        message: `Your request was approved by ${reviewer.first_name} ${reviewer.last_name} and forwarded to ${nextRole} for review.`,
        type: 'FORWARDED'
      });

      logger.info(`[WorkflowEngine] Request ${reqData.request_code} forwarded to ${nextRole} (step ${nextStep.step_order}).`);
      return {
        status: 'FORWARDED',
        requestId,
        requestCode: reqData.request_code,
        nextRole,
        nextStepOrder: nextStep.step_order
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = WorkflowEngine;
