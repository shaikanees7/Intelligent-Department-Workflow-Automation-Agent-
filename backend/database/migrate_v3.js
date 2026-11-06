/**
 * Migration v3: Centralized Authentication, Staff Profiles, Section Mappings, and Audit Logging
 */

const db = require('./db');

async function runMigration() {
  console.log('--- RUNNING MIGRATION V3: USER AUTH & CENTRALIZED WORKFLOW MAPPING ---');
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Add employee_id to users if not present
    const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'employee_id'");
    if (cols.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) NULL AFTER phone");
      console.log('✅ Added employee_id to users table');
    }

    // 2. Add assigned_responsibilities to users if not present
    const [colResp] = await connection.query("SHOW COLUMNS FROM users LIKE 'assigned_responsibilities'");
    if (colResp.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN assigned_responsibilities TEXT NULL AFTER department_id");
      console.log('✅ Added assigned_responsibilities to users table');
    }

    // 3. Add must_change_password to users if not present
    const [colPass] = await connection.query("SHOW COLUMNS FROM users LIKE 'must_change_password'");
    if (colPass.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE AFTER is_active");
      console.log('✅ Added must_change_password to users table');
    }

    // 4. Update role ENUM to include OFFICE_STAFF
    await connection.query("ALTER TABLE users MODIFY COLUMN role ENUM('STUDENT','FACULTY','MENTOR','HOD','ADMIN','OFFICE_ADMIN','OFFICE_STAFF') NOT NULL");
    console.log('✅ Updated users role enum to include OFFICE_STAFF');

    // 5. Create mentor_section_assignments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mentor_section_assignments (
        assignment_id INT AUTO_INCREMENT PRIMARY KEY,
        department_id INT NOT NULL,
        section VARCHAR(20) NOT NULL,
        mentor_user_id INT NOT NULL,
        academic_year VARCHAR(20) DEFAULT '2025-2026',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_dept_section (department_id, section, academic_year)
      )
    `);
    console.log('✅ Created mentor_section_assignments table');

    // 6. Create audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50) NULL,
        details TEXT NULL,
        ip_address VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created audit_logs table');

    // 7. Seed default Section Mentors for CSE (Section A, B, C, D)
    // Prof. Suresh Reddy (user_id 4) is Senior Mentor in CSE
    const [mentorCheck] = await connection.query('SELECT user_id FROM users WHERE user_id = 4 AND role = "MENTOR"');
    if (mentorCheck.length > 0) {
      const sections = ['A', 'B', 'C', 'D'];
      for (const sec of sections) {
        await connection.query(`
          INSERT INTO mentor_section_assignments (department_id, section, mentor_user_id, academic_year)
          VALUES (1, ?, 4, '2025-2026')
          ON DUPLICATE KEY UPDATE mentor_user_id = VALUES(mentor_user_id)
        `, [sec]);
      }
      console.log('✅ Seeded default CSE Section Mentors (A, B, C, D) -> Prof. Suresh Reddy');
    }

    // 8. Ensure HOD Dr. Ramesh Kumar (user_id 2) has employee_id set
    await connection.query("UPDATE users SET employee_id = 'EMP-HOD-CSE-01' WHERE user_id = 2 AND employee_id IS NULL");
    await connection.query("UPDATE users SET employee_id = 'EMP-FAC-CSE-01' WHERE user_id = 3 AND employee_id IS NULL");
    await connection.query("UPDATE users SET employee_id = 'EMP-MEN-CSE-01' WHERE user_id = 4 AND employee_id IS NULL");
    await connection.query("UPDATE users SET employee_id = 'EMP-ADM-ROOT-01' WHERE user_id = 1 AND employee_id IS NULL");

    await connection.commit();
    console.log('🎉 MIGRATION V3 COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
