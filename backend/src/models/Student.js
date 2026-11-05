const db = require('../../database/db');

class Student {
  static async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT s.*, u.first_name, u.last_name, u.email, d.name AS department_name, ma.mentor_user_id
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN mentor_assignments ma ON s.user_id = ma.student_user_id
       WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0];
  }
}

module.exports = Student;
