const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('[Seed] Seeding sample institutional data...');
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Departments
    await db.query(`
      INSERT IGNORE INTO departments (department_id, code, name) VALUES
      (1, 'CSE', 'Computer Science and Engineering'),
      (2, 'ECE', 'Electronics and Communication Engineering'),
      (3, 'MECH', 'Mechanical Engineering')
    `);

    // 2. Sample Users (Admin, HOD, Faculty, Mentor, Student)
    await db.query(`
      INSERT IGNORE INTO users (user_id, email, password_hash, first_name, last_name, phone, role, department_id) VALUES
      (1, 'admin@institution.edu', '${passwordHash}', 'System', 'Admin', '9876543210', 'ADMIN', 1),
      (2, 'hod.cse@institution.edu', '${passwordHash}', 'Dr. Ramesh', 'Kumar', '9876543211', 'HOD', 1),
      (3, 'faculty.cse@institution.edu', '${passwordHash}', 'Prof. Anitha', 'Sharma', '9876543212', 'FACULTY', 1),
      (4, 'mentor.cse@institution.edu', '${passwordHash}', 'Prof. Suresh', 'Reddy', '9876543213', 'MENTOR', 1),
      (5, 'student1@institution.edu', '${passwordHash}', 'Anees', 'Shaik', '9876543214', 'STUDENT', 1)
    `);

    // 3. Profiles
    await db.query(`
      INSERT IGNORE INTO students (student_id, user_id, registration_number, section, semester, batch_year) VALUES
      (1, 5, 'REG2024CSE001', 'A', 6, '2022-2026')
    `);

    await db.query(`
      INSERT IGNORE INTO faculty (faculty_id, user_id, employee_id, designation, cabin_location) VALUES
      (1, 2, 'EMP_HOD_01', 'Head of Department', 'Block A - 301'),
      (2, 3, 'EMP_FAC_01', 'Assistant Professor', 'Block A - 204'),
      (3, 4, 'EMP_MEN_01', 'Senior Assistant Professor', 'Block A - 208')
    `);

    // 4. Mentor Assignment
    await db.query(`
      INSERT IGNORE INTO mentor_assignments (assignment_id, student_user_id, mentor_user_id, academic_year) VALUES
      (1, 5, 4, '2025-2026')
    `);

    // 5. Workflows
    await db.query(`
      INSERT IGNORE INTO approval_workflows (workflow_id, request_type, workflow_name, description) VALUES
      (1, 'OD', 'On-Duty Approval Workflow', 'Mentor verification -> Faculty approval -> HOD final approval'),
      (2, 'LEAVE', 'Student Leave Workflow', 'Mentor verification -> HOD final approval'),
      (3, 'EVENT', 'Event Participation Workflow', 'Mentor verification -> Faculty Coordinator approval -> HOD approval')
    `);

    // 6. Workflow Steps
    await db.query(`
      INSERT IGNORE INTO approval_steps (workflow_id, step_order, required_role, step_name) VALUES
      (1, 1, 'MENTOR', 'Mentor Verification'),
      (1, 2, 'FACULTY', 'Department Faculty Approval'),
      (1, 3, 'HOD', 'HOD Final Sanction'),
      (2, 1, 'MENTOR', 'Mentor Verification'),
      (2, 2, 'HOD', 'HOD Sanction'),
      (3, 1, 'MENTOR', 'Mentor Verification'),
      (3, 2, 'FACULTY', 'Event Coordinator Verification'),
      (3, 3, 'HOD', 'HOD Sanction')
    `);

    console.log('[Seed] Database successfully seeded with default workflows, roles and credentials.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
