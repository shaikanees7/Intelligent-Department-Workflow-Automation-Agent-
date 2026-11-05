const cron = require('node-cron');
const db = require('../../database/db');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Intelligent Cron Automation:
 * Scans every hour for pending requests older than threshold (e.g. 24h)
 * and sends reminder notifications to the responsible reviewing authority.
 */
const initReminderCron = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('[Cron Reminder] Checking for stagnant approval requests...');
    try {
      const [pendingRequests] = await db.query(
        `SELECT r.*, u.email, u.first_name, u.last_name 
         FROM permission_requests r
         JOIN users u ON r.current_reviewer_user_id = u.user_id
         WHERE r.overall_status IN ('SUBMITTED', 'PENDING', 'UNDER_REVIEW')
         AND r.updated_at < NOW() - INTERVAL 24 HOUR`
      );

      for (const req of pendingRequests) {
        await Notification.create({
          user_id: req.current_reviewer_user_id,
          request_id: req.request_id,
          title: 'Urgent: Pending Request Reminder',
          message: `Request ${req.request_code} has been awaiting your action for over 24 hours. Please review promptly.`,
          type: 'REMINDER'
        });
      }
    } catch (err) {
      logger.error('[Cron Reminder Error]: ' + err.message);
    }
  });
};

module.exports = { initReminderCron };
