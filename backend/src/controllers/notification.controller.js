const Notification = require('../models/Notification');
const db = require('../../database/db');
const ApiResponse = require('../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const list = await Notification.getByUser(req.user.userId);
    return ApiResponse.success(res, 'Notifications retrieved', list);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?', [
      id,
      req.user.userId
    ]);
    return ApiResponse.success(res, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.userId]);
    return ApiResponse.success(res, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
