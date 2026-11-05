const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedOffices() {
  console.log('[Seed Offices] Seeding 9 University Administrative Offices and Staff...');
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Insert 9 Official University Offices
    const offices = [
      {
        office_id: 1,
        name: 'Examination Cell',
        code: 'EXAM_CELL',
        category: 'Examination & Evaluation',
        description: 'Governs all mid-term, semester-end examinations, supplementary exams, grade sheets, hall ticket clashes, and lab re-examinations.',
        responsible_officer: 'Dr. C. Venkatesh (Controller of Examinations)',
        contact_email: 'office.exam@institution.edu',
        contact_phone: '+91 863 2344710',
        location: 'Administrative Block - 1st Floor, Room 108',
        supported_permission_types: JSON.stringify([
          'Examination Reschedule',
          'Supplementary Examination Clearance',
          'Hall Ticket Clash Exemption',
          'Lab Practical Re-exam',
          'Marks Card Endorsement'
        ])
      },
      {
        office_id: 2,
        name: 'Finance Office',
        code: 'FINANCE_OFFICE',
        category: 'Accounts & Tuition',
        description: 'Manages tuition fee clearances, installment plans, examination fee waivers, scholarship disbursement certificates, and no-dues endorsements.',
        responsible_officer: 'Mr. P. Narayana Rao (Finance Officer)',
        contact_email: 'office.finance@institution.edu',
        contact_phone: '+91 863 2344715',
        location: 'Main Administrative Complex - Ground Floor, Cashier Wing',
        supported_permission_types: JSON.stringify([
          'Semester Tuition Fee Extension',
          'Examination Fee Due Clearance',
          'Scholarship Endorsement',
          'Refund & Dues Settlement',
          'Challan Verification'
        ])
      },
      {
        office_id: 3,
        name: 'Hostel Office / Chief Warden',
        code: 'HOSTEL_OFFICE',
        category: 'Student Housing & Residential',
        description: 'Oversees student hostel admissions, night outing gate passes, emergency hometown travel, room allocations, and mess rebates.',
        responsible_officer: 'Prof. K. Satyanarayana (Chief Warden)',
        contact_email: 'office.hostel@institution.edu',
        contact_phone: '+91 863 2344730',
        location: 'Hostel Block A - Chief Warden Office',
        supported_permission_types: JSON.stringify([
          'Weekend Hostel Outing Pass',
          'Night Leave Permission',
          'Emergency Hometown Departure',
          'Hostel Room Transfer',
          'Mess Fee Concession'
        ])
      },
      {
        office_id: 4,
        name: 'Academic Office',
        code: 'ACADEMIC_OFFICE',
        category: 'Academics & Curriculum',
        description: 'Handles course registrations, branch electives, semester condonations, bonafide credentials, and university degree verification.',
        responsible_officer: 'Dr. M. S. R. Prasad (Dean of Academic Affairs)',
        contact_email: 'office.academic@institution.edu',
        contact_phone: '+91 863 2344720',
        location: 'Academic Bhavan - 2nd Floor, Room 204',
        supported_permission_types: JSON.stringify([
          'Academic Attendance Condonation',
          'Course Add / Drop Clearance',
          'Bonafide & Medium of Instruction Pass',
          'Semester Interruption / Re-admission',
          'Internship Academic Credit Approval'
        ])
      },
      {
        office_id: 5,
        name: 'Department Office',
        code: 'DEPT_OFFICE',
        category: 'Departmental Affairs',
        description: 'Handles department lab access, research facility clearance, project room allocations, industrial tour sanctions, and student club permissions.',
        responsible_officer: 'Dr. Ramesh Kumar (HOD - CSE)',
        contact_email: 'hod.cse@institution.edu',
        contact_phone: '+91 863 2344740',
        location: 'CSE Department Complex - Room 301',
        supported_permission_types: JSON.stringify([
          'Special Lab Access Permission',
          'Department Workshop OD',
          'Industrial Visit Sanction',
          'Project Equipment Clearance',
          'Faculty Consultation Leave'
        ])
      },
      {
        office_id: 6,
        name: 'University Central Library',
        code: 'LIBRARY',
        category: 'Information & Digital Resources',
        description: 'Coordinates digital repository permissions, book return extensions, inter-library exchange clearance, and thesis plagiarism checks.',
        responsible_officer: 'Dr. V. Radhika (University Chief Librarian)',
        contact_email: 'office.library@institution.edu',
        contact_phone: '+91 863 2344750',
        location: 'Dr. A.P.J. Abdul Kalam Central Library - Level 1',
        supported_permission_types: JSON.stringify([
          'Overdue Fine Waiver Permission',
          'Inter-Library Borrowing Pass',
          'Research Database Access',
          'Thesis Clearance Endorsement',
          'Extended Study Room Hours'
        ])
      },
      {
        office_id: 7,
        name: 'Transportation Office',
        code: 'TRANSPORT_OFFICE',
        category: 'Logistics & Transit',
        description: 'Manages university campus shuttle passes, bus route changes, weekend trip transportation clearance, and parking permits.',
        responsible_officer: 'Mr. B. Srinivasa Rao (Transport Manager)',
        contact_email: 'office.transport@institution.edu',
        contact_phone: '+91 863 2344760',
        location: 'Automotive & Transit Bay - Depot Office',
        supported_permission_types: JSON.stringify([
          'University Bus Pass Renewal',
          'Transit Route Shift Clearance',
          'Field Trip Vehicle Sanction',
          'Student Vehicle Campus Parking Pass'
        ])
      },
      {
        office_id: 8,
        name: 'Sports Department',
        code: 'SPORTS_DEPT',
        category: 'Athletics & Physical Education',
        description: 'Facilitates university athletic team representation, national/state tournament OD, indoor stadium access, and gym permissions.',
        responsible_officer: 'Capt. T. Anand (Director of Physical Education)',
        contact_email: 'office.sports@institution.edu',
        contact_phone: '+91 863 2344770',
        location: 'Indoor Sports Arena - Director Chamber',
        supported_permission_types: JSON.stringify([
          'Inter-University Sports Tournament OD',
          'Athletic Training Camp Leave',
          'University Gymnasium Membership',
          'Sports Kit & Equipment Loan'
        ])
      },
      {
        office_id: 9,
        name: 'Student Affairs & Cultural Office',
        code: 'STUDENT_AFFAIRS',
        category: 'Co-Curricular & Student Welfare',
        description: 'Coordinates annual cultural fest organizing, club activity sanctions, inter-college events, and guest speaker permissions.',
        responsible_officer: 'Dr. G. Lakshmi (Dean of Student Affairs)',
        contact_email: 'office.affairs@institution.edu',
        contact_phone: '+91 863 2344780',
        location: 'Student Activity Center - 1st Floor',
        supported_permission_types: JSON.stringify([
          'Cultural Fest Volunteer OD',
          'Student Club Event Authorization',
          'External Fest Participation',
          'Student Welfare Activity Sanction'
        ])
      }
    ];

    for (const off of offices) {
      await db.query(`
        INSERT INTO university_offices 
        (office_id, name, code, category, description, responsible_officer, contact_email, contact_phone, location, supported_permission_types, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name=VALUES(name), category=VALUES(category), description=VALUES(description),
          responsible_officer=VALUES(responsible_officer), contact_email=VALUES(contact_email),
          contact_phone=VALUES(contact_phone), location=VALUES(location),
          supported_permission_types=VALUES(supported_permission_types), is_active=VALUES(is_active)
      `, [
        off.office_id, off.name, off.code, off.category, off.description,
        off.responsible_officer, off.contact_email, off.contact_phone, off.location,
        off.supported_permission_types
      ]);
    }

    // 2. Insert Dedicated Office Admin Accounts
    const officeUsers = [
      { id: 10, email: 'office.exam@institution.edu', fName: 'Exam', lName: 'Coordinator', phone: '9876543220', officeId: 1, role: 'OFFICE_ADMIN', desig: 'Controller of Examinations' },
      { id: 11, email: 'office.finance@institution.edu', fName: 'Finance', lName: 'Officer', phone: '9876543221', officeId: 2, role: 'OFFICE_ADMIN', desig: 'Chief Accounts Officer' },
      { id: 12, email: 'office.hostel@institution.edu', fName: 'Chief', lName: 'Warden', phone: '9876543222', officeId: 3, role: 'OFFICE_ADMIN', desig: 'Chief Residential Warden' },
      { id: 13, email: 'office.academic@institution.edu', fName: 'Academic', lName: 'Dean', phone: '9876543223', officeId: 4, role: 'OFFICE_ADMIN', desig: 'Dean of Academic Affairs' },
      { id: 14, email: 'office.sports@institution.edu', fName: 'Sports', lName: 'Director', phone: '9876543224', officeId: 8, role: 'OFFICE_ADMIN', desig: 'Director of Physical Education' }
    ];

    for (const u of officeUsers) {
      await db.query(`
        INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone, role, department_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, TRUE)
        ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), role=VALUES(role), is_active=VALUES(is_active)
      `, [u.id, u.email, passwordHash, u.fName, u.lName, u.phone, u.role]);

      await db.query(`
        INSERT INTO office_staff (office_id, user_id, designation, is_primary_admin)
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE designation=VALUES(designation), is_primary_admin=TRUE
      `, [u.officeId, u.id, u.desig]);
    }

    // 3. Seed Initial AI Classifications & Office Assignments for Existing Requests
    // Request 1: REQ-842104 (Smart India Hackathon -> Department Office + Student Affairs)
    await db.query(`
      INSERT INTO ai_classification_logs (request_id, model_used, permission_category, suggested_primary_office, suggested_secondary_offices, reason, confidence, requires_clarification, status)
      VALUES (1, 'gemini-3.5-flash-lite', 'Technical Hackathon Participation', 'Department Office', '["Student Affairs & Cultural Office"]', 'National coding hackathon requires departmental academic clearance and attendance condonation.', 0.940, FALSE, 'ROUTED')
      ON DUPLICATE KEY UPDATE confidence=VALUES(confidence)
    `);
    await db.query(`
      INSERT INTO application_office_assignments (request_id, office_id, assigned_by, status, remarks)
      VALUES (1, 5, 'AI_ROUTING', 'ACCEPTED', 'Routed by AI Agent to Department Office.')
      ON DUPLICATE KEY UPDATE status=VALUES(status)
    `);

    // Request 6: REQ-915432 (Cloud Computing Lab Reschedule -> Examination Cell)
    await db.query(`
      INSERT INTO ai_classification_logs (request_id, model_used, permission_category, suggested_primary_office, suggested_secondary_offices, reason, confidence, requires_clarification, status)
      VALUES (6, 'gemini-3.5-flash-lite', 'Laboratory Practical Reschedule', 'Examination Cell', '["Department Office"]', 'Lab exam rescheduling falls under the jurisdiction of the Examination Cell in coordination with the department.', 0.965, FALSE, 'ROUTED')
      ON DUPLICATE KEY UPDATE confidence=VALUES(confidence)
    `);
    await db.query(`
      INSERT INTO application_office_assignments (request_id, office_id, assigned_by, status, remarks)
      VALUES (6, 1, 'AI_ROUTING', 'PENDING', 'Awaiting Examination Cell verification.')
      ON DUPLICATE KEY UPDATE status=VALUES(status)
    `);

    console.log('[Seed Offices] Successfully seeded 9 university offices and office administrator users.');
  } catch (err) {
    console.error('[Seed Offices Error]:', err);
    throw err;
  }
}

if (require.main === module) {
  seedOffices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedOffices;

