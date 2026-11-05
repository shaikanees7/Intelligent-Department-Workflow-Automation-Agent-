const db = require('../../database/db');

class User {
  static formatUser(row) {
    if (!row) return null;
    return {
      userId: row.user_id,
      user_id: row.user_id,
      email: row.email,
      firstName: row.first_name,
      first_name: row.first_name,
      lastName: row.last_name,
      last_name: row.last_name,
      phone: row.phone || null,
      role: row.role,
      departmentId: row.department_id,
      department_id: row.department_id,
      departmentName: row.department_name || (row.role === 'ADMIN' ? 'Central Administration' : 'Computer Science and Engineering'),
      department_name: row.department_name || (row.role === 'ADMIN' ? 'Central Administration' : 'Computer Science and Engineering'),
      registrationNumber: row.registration_number || (row.role === 'STUDENT' ? '241FA18363' : undefined),
      registration_number: row.registration_number || (row.role === 'STUDENT' ? '241FA18363' : undefined),
      section: row.section || (row.role === 'STUDENT' ? 'A' : undefined),
      semester: row.semester || (row.role === 'STUDENT' ? 6 : undefined),
      batchYear: row.batch_year || (row.role === 'STUDENT' ? '2022-2026' : undefined),
      batch_year: row.batch_year || (row.role === 'STUDENT' ? '2022-2026' : undefined),
      designation: row.designation || (row.role === 'HOD' ? 'Head of Department' : row.role === 'MENTOR' ? 'Senior Assistant Professor' : row.role === 'FACULTY' ? 'Assistant Professor' : undefined),
      cabinLocation: row.cabin_location || undefined,
      cabin_location: row.cabin_location || undefined,
      isActive: Boolean(row.is_active),
      is_active: Boolean(row.is_active)
    };
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT u.*, 
              d.name AS department_name, d.code AS department_code,
              s.registration_number, s.section, s.semester, s.batch_year,
              f.employee_id, f.designation, f.cabin_location
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       WHERE LOWER(u.email) = LOWER(?)`,
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT u.*, 
              d.name AS department_name, d.code AS department_code,
              s.registration_number, s.section, s.semester, s.batch_year,
              f.employee_id, f.designation, f.cabin_location
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       WHERE u.user_id = ?`,
      [id]
    );
    return rows[0] ? this.formatUser(rows[0]) : null;
  }

  static async create({ email, password_hash, first_name, last_name, phone, role, department_id }) {
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, first_name, last_name, phone || null, role, department_id || 1]
    );
    return result.insertId;
  }

  static async update(id, fields) {
    const allowed = ['first_name', 'last_name', 'phone', 'is_active', 'department_id'];
    const updates = [];
    const values = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return false;
    values.push(id);

    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, values);
    return true;
  }
}

module.exports = User;
