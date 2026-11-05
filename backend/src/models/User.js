const db = require('../../database/db');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name, u.role, u.department_id, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE u.user_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create({ email, password_hash, first_name, last_name, phone, role, department_id }) {
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, first_name, last_name, phone, role, department_id]
    );
    return result.insertId;
  }
}

module.exports = User;
