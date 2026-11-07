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
      photoUrl: row.photo_url || null,
      photo_url: row.photo_url || null,
      photoUpdatedAt: row.photo_updated_at || null,
      photo_updated_at: row.photo_updated_at || null,
      section: row.section || (row.role === 'STUDENT' ? 'A' : undefined),
      semester: row.semester || (row.role === 'STUDENT' ? 6 : undefined),
      batchYear: row.batch_year || (row.role === 'STUDENT' ? '2022-2026' : undefined),
      batch_year: row.batch_year || (row.role === 'STUDENT' ? '2022-2026' : undefined),
      designation: row.designation || (row.role === 'HOD' ? 'Head of Department' : row.role === 'MENTOR' ? 'Senior Assistant Professor' : row.role === 'FACULTY' ? 'Assistant Professor' : undefined),
      cabinLocation: row.cabin_location || undefined,
      cabin_location: row.cabin_location || undefined,
      employeeId: row.employee_id || undefined,
      employee_id: row.employee_id || undefined,
      assignedResponsibilities: row.assigned_responsibilities || undefined,
      assigned_responsibilities: row.assigned_responsibilities || undefined,
      mustChangePassword: Boolean(row.must_change_password),
      must_change_password: Boolean(row.must_change_password),
      officeId: row.office_id || (row.role === 'OFFICE_ADMIN' ? 1 : undefined),
      office_id: row.office_id || (row.role === 'OFFICE_ADMIN' ? 1 : undefined),
      officeName: row.office_name || (row.role === 'OFFICE_ADMIN' ? 'Examination Cell' : undefined),
      office_name: row.office_name || (row.role === 'OFFICE_ADMIN' ? 'Examination Cell' : undefined),
      officeCode: row.office_code || (row.role === 'OFFICE_ADMIN' ? 'EXAM_CELL' : undefined),
      office_code: row.office_code || (row.role === 'OFFICE_ADMIN' ? 'EXAM_CELL' : undefined),
      isActive: Boolean(row.is_active),
      is_active: Boolean(row.is_active)
    };
  }

  static async findByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    let altEmail = cleanEmail;
    if (cleanEmail.endsWith('@univ.edu')) {
      const prefix = cleanEmail.replace('@univ.edu', '');
      altEmail = `${prefix}@institution.edu`;
      if (prefix === 'admin') altEmail = 'admin@institution.edu';
      if (prefix === 'hod' || prefix === 'hod.cse') altEmail = 'hod.cse@institution.edu';
      if (prefix === 'faculty' || prefix === 'faculty.cse') altEmail = 'faculty.cse@institution.edu';
      if (prefix === 'mentor' || prefix === 'mentor.cse') altEmail = 'mentor.cse@institution.edu';
    } else if (cleanEmail.endsWith('@institution.edu')) {
      const prefix = cleanEmail.replace('@institution.edu', '');
      altEmail = `${prefix}@univ.edu`;
    }

    const [rows] = await db.query(
      `SELECT u.*, 
              d.name AS department_name, d.code AS department_code,
              s.registration_number, s.section, s.semester, s.batch_year, s.photo_url, s.photo_updated_at,
              COALESCE(f.designation, os.designation) AS designation,
              COALESCE(u.employee_id, f.employee_id) AS employee_id,
              f.cabin_location,
              os.office_id, uo.name AS office_name, uo.code AS office_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       LEFT JOIN office_staff os ON u.user_id = os.user_id
       LEFT JOIN university_offices uo ON os.office_id = uo.office_id
       WHERE LOWER(u.email) = ? OR LOWER(u.email) = ?
       LIMIT 1`,
      [cleanEmail, altEmail]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT u.*, 
              d.name AS department_name, d.code AS department_code,
              s.registration_number, s.section, s.semester, s.batch_year, s.photo_url, s.photo_updated_at,
              COALESCE(f.designation, os.designation) AS designation,
              COALESCE(u.employee_id, f.employee_id) AS employee_id,
              f.cabin_location,
              os.office_id, uo.name AS office_name, uo.code AS office_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.department_id
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       LEFT JOIN office_staff os ON u.user_id = os.user_id
       LEFT JOIN university_offices uo ON os.office_id = uo.office_id
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
