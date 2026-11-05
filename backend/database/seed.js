const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('[Seed] Seeding institutional database with roles, workflows and requests...');
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Departments
    await db.query(`
      INSERT INTO departments (department_id, code, name) VALUES
      (1, 'CSE', 'Computer Science and Engineering'),
      (2, 'ECE', 'Electronics and Communication Engineering'),
      (3, 'MECH', 'Mechanical Engineering'),
      (4, 'IT', 'Information Technology'),
      (5, 'CIVIL', 'Civil Engineering')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);

    // 2. Users (Admin, HOD, Faculty, Mentor, Students)
    await db.query(`
      INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone, role, department_id, is_active) VALUES
      (1, 'admin@institution.edu', '${passwordHash}', 'System', 'Administrator', '9876543210', 'ADMIN', 1, TRUE),
      (2, 'hod.cse@institution.edu', '${passwordHash}', 'Dr. Ramesh', 'Kumar', '9876543211', 'HOD', 1, TRUE),
      (3, 'faculty.cse@institution.edu', '${passwordHash}', 'Prof. Anitha', 'Sharma', '9876543212', 'FACULTY', 1, TRUE),
      (4, 'mentor.cse@institution.edu', '${passwordHash}', 'Prof. Suresh', 'Reddy', '9876543213', 'MENTOR', 1, TRUE),
      (5, 'student1@institution.edu', '${passwordHash}', 'Anees', 'Shaik', '9876543214', 'STUDENT', 1, TRUE),
      (6, 'vu.241fa18363@gmail.com', '${passwordHash}', 'Anees', 'Shaik', '9876543215', 'STUDENT', 1, TRUE),
      (7, 'rahul.varma@institution.edu', '${passwordHash}', 'Rahul', 'Varma', '9876543216', 'STUDENT', 1, TRUE),
      (8, 'priya.sundaram@institution.edu', '${passwordHash}', 'Priya', 'Sundaram', '9876543217', 'STUDENT', 1, TRUE)
      ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), password_hash=VALUES(password_hash)
    `);

    // 3. Faculty Profiles
    await db.query(`
      INSERT INTO faculty (faculty_id, user_id, employee_id, designation, cabin_location) VALUES
      (1, 2, 'EMP_HOD_01', 'Head of Department', 'Block A - 301'),
      (2, 3, 'EMP_FAC_01', 'Assistant Professor', 'Block A - 204'),
      (3, 4, 'EMP_MEN_01', 'Senior Assistant Professor', 'Block A - 208')
      ON DUPLICATE KEY UPDATE designation=VALUES(designation), cabin_location=VALUES(cabin_location)
    `);

    // 4. Student Profiles
    await db.query(`
      INSERT INTO students (student_id, user_id, registration_number, section, semester, batch_year) VALUES
      (1, 5, 'REG2024CSE001', 'A', 6, '2022-2026'),
      (2, 6, '241FA18363', 'A', 6, '2022-2026'),
      (3, 7, 'REG2024CSE042', 'B', 6, '2022-2026'),
      (4, 8, 'REG2024CSE018', 'A', 6, '2022-2026')
      ON DUPLICATE KEY UPDATE registration_number=VALUES(registration_number), section=VALUES(section)
    `);

    // 5. Mentor Assignments (map all students to Prof. Suresh Reddy user_id 4)
    await db.query(`
      INSERT INTO mentor_assignments (assignment_id, student_user_id, mentor_user_id, academic_year) VALUES
      (1, 5, 4, '2025-2026'),
      (2, 6, 4, '2025-2026'),
      (3, 7, 4, '2025-2026'),
      (4, 8, 4, '2025-2026')
      ON DUPLICATE KEY UPDATE mentor_user_id=VALUES(mentor_user_id)
    `);

    // 6. Approval Workflows Definition (OD, LEAVE, EVENT, EXAM)
    await db.query(`
      INSERT INTO approval_workflows (workflow_id, request_type, workflow_name, description, is_active) VALUES
      (1, 'OD', 'On-Duty Approval Workflow', 'Mentor verification -> Faculty coordinator approval -> HOD final sanction', TRUE),
      (2, 'LEAVE', 'Student Leave Workflow', 'Mentor verification -> HOD final approval', TRUE),
      (3, 'EVENT', 'Event Participation Workflow', 'Mentor verification -> Event faculty coordinator approval -> HOD sanction', TRUE),
      (4, 'EXAM', 'Exam Permission Workflow', 'Mentor verification -> Exam coordinator review -> HOD sanction', TRUE)
      ON DUPLICATE KEY UPDATE workflow_name=VALUES(workflow_name), description=VALUES(description)
    `);

    // 7. Workflow Steps
    await db.query(`
      INSERT INTO approval_steps (step_id, workflow_id, step_order, required_role, step_name, can_bypass) VALUES
      (1, 1, 1, 'MENTOR', 'Mentor Academic Verification', FALSE),
      (2, 1, 2, 'FACULTY', 'Department Faculty Approval', FALSE),
      (3, 1, 3, 'HOD', 'HOD Final Sanction', FALSE),

      (4, 2, 1, 'MENTOR', 'Mentor Verification & Attendance Check', FALSE),
      (5, 2, 2, 'HOD', 'HOD Sanction & Attendance Exemption', FALSE),

      (6, 3, 1, 'MENTOR', 'Mentor Verification', FALSE),
      (7, 3, 2, 'FACULTY', 'Event Faculty Coordinator Sanction', FALSE),
      (8, 3, 3, 'HOD', 'HOD Final Approval', FALSE),

      (9, 4, 1, 'MENTOR', 'Mentor Eligibility Verification', FALSE),
      (10, 4, 2, 'FACULTY', 'Exam Coordinator / Faculty Review', FALSE),
      (11, 4, 3, 'HOD', 'HOD Final Clearance', FALSE)
      ON DUPLICATE KEY UPDATE step_name=VALUES(step_name)
    `);

    // 8. Permission Requests
    await db.query(`
      INSERT INTO permission_requests 
      (request_id, request_code, student_user_id, request_type, reason, start_date, end_date, is_urgent, current_step_order, current_reviewer_role, current_reviewer_user_id, overall_status, pdf_letter_url) VALUES
      (1, 'REQ-842104', 5, 'OD', 'Selected for National Smart India Hackathon Grand Finale in Bangalore. Need 3 days On-Duty permission to travel and compete.', '2026-11-08', '2026-11-10', 1, 2, 'FACULTY', 3, 'UNDER_REVIEW', NULL),
      (2, 'REQ-842109', 7, 'EVENT', 'Paper presentation on AI-Driven Automation at IEEE International Conference.', '2026-11-15', '2026-11-16', 0, 2, 'FACULTY', 3, 'UNDER_REVIEW', NULL),
      (3, 'REQ-842115', 8, 'LEAVE', 'Medical rest requested due to viral fever. Doctor prescription attached.', '2026-11-09', '2026-11-11', 1, 1, 'MENTOR', 4, 'UNDER_REVIEW', NULL),
      (4, 'REQ-791024', 5, 'LEAVE', 'Attending family wedding ceremony in hometown.', '2026-10-20', '2026-10-22', 0, 2, NULL, NULL, 'APPROVED', '/uploads/permission_letter_REQ-791024.pdf'),
      (5, 'REQ-640192', 5, 'EVENT', 'Participated in Inter-College Robotics Challenge at Technical Symposium.', '2026-09-12', '2026-09-13', 0, 3, NULL, NULL, 'APPROVED', '/uploads/permission_letter_REQ-640192.pdf'),
      (6, 'REQ-915432', 5, 'EXAM', '[EXAM Subject: CS402 Cloud Computing Lab Reschedule] Clashing with university sports selection trial.', '2026-11-15', '2026-11-15', 0, 1, 'MENTOR', 4, 'PENDING', NULL)
      ON DUPLICATE KEY UPDATE overall_status=VALUES(overall_status), current_step_order=VALUES(current_step_order)
    `);

    // 9. Approval History Audit Trail
    await db.query(`
      INSERT INTO approval_history (history_id, request_id, step_order, reviewer_user_id, action, remarks, action_timestamp) VALUES
      (1, 1, 1, 4, 'VERIFIED', 'Verified student academic attendance (88%). Active coding club leader. Recommended.', '2026-11-04 10:15:00'),
      (2, 2, 1, 4, 'VERIFIED', 'Conference acceptance certificate verified. Recommended.', '2026-11-04 15:30:00'),
      (3, 4, 1, 4, 'VERIFIED', 'Parental phone consent confirmed.', '2026-10-18 12:00:00'),
      (4, 4, 2, 2, 'APPROVED', 'Sanctioned by Head of Department.', '2026-10-19 09:30:00'),
      (5, 5, 1, 4, 'VERIFIED', 'Robotics club faculty advisor recommendation acknowledged.', '2026-09-10 16:00:00'),
      (6, 5, 2, 3, 'APPROVED', 'Lab schedule adjusted for team.', '2026-09-11 11:00:00'),
      (7, 5, 3, 2, 'APPROVED', 'Final approval granted with institutional attendance credit.', '2026-09-11 15:00:00')
      ON DUPLICATE KEY UPDATE remarks=VALUES(remarks)
    `);

    // 10. Notifications
    await db.query(`
      INSERT INTO notifications (notification_id, user_id, request_id, title, message, type, is_read) VALUES
      (1, 5, 1, 'Application Forwarded to Faculty', 'Your On-Duty request REQ-842104 has been verified by Mentor Prof. Suresh Reddy and forwarded to Faculty Review.', 'FORWARDED', FALSE),
      (2, 5, 4, 'Leave Request Approved', 'Your Leave request REQ-791024 has received final sanction. Digital pass is ready to download.', 'APPROVAL', TRUE),
      (3, 4, 3, 'New Mentee Verification Pending', 'Priya Sundaram submitted a medical leave request awaiting your verification.', 'ASSIGNMENT', FALSE),
      (4, 4, 6, 'Exam Permission Request Received', 'Anees Shaik submitted an Exam Reschedule permission request REQ-915432.', 'ASSIGNMENT', FALSE),
      (5, 3, 1, 'Faculty Action Required', 'On-Duty request REQ-842104 forwarded from Mentor awaiting department sanction.', 'ASSIGNMENT', FALSE),
      (6, 2, 1, 'Department Status Update', 'Hackathon on-duty participation queue active in CSE department.', 'SUBMISSION', FALSE)
      ON DUPLICATE KEY UPDATE message=VALUES(message)
    `);

    console.log('[Seed] Database successfully seeded with full university dataset.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
