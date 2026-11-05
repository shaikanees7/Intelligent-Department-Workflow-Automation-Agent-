const db = require('../../database/db');

class Notification {
  static async create({ user_id, request_id, title, message, type }) {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, request_id, title, message, type)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, request_id, title, message, type]
    );
    return result.insertId;
  }

  static async getByUser(userId) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return rows;
  }
}

module.exports = Notification;
