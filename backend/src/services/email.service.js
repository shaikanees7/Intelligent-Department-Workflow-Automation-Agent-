const transporter = require('../config/mail.config');
const logger = require('../utils/logger');

const sendNotificationEmail = async (to, subject, text, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.info(`[Email Service (Simulated)] To: ${to} | Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Workflow Automation <no-reply@institution.edu>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });
    logger.info(`[Email Sent] Successfully delivered to ${to}`);
  } catch (err) {
    logger.error('[Email Error]: ' + err.message);
  }
};

module.exports = { sendNotificationEmail };
