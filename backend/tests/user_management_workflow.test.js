/**
 * Automated Verification Suite for Centralized User Management, 
 * Role-Based Access Control, and Connected Approval Workflows
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🚀 RUNNING VERIFICATION SUITE: USER MANAGEMENT & CONNECTED WORKFLOW');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // -------------------------------------------------------------------------
    // TEST 1: Public Registration Restricted to Students (Reject Non-Student Roles)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Enforcing Public Registration Restriction (Reject Non-Student Roles with HTTP 403)...');
    
    // Attempt to register as HOD
    const rejectHODRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hacker_hod_${timestamp}@univ.edu`,
        password: 'Password123!',
        first_name: 'Fake',
        last_name: 'HOD',
        role: 'HOD',
        department_id: 1
      })
    });
    const rejectHODData = await rejectHODRes.json();
    assert(
      rejectHODRes.status === 403 && rejectHODData.success === false,
      `Attempted HOD public registration rejected with HTTP 403 (Got status ${rejectHODRes.status}: "${rejectHODData.message}")`
    );

    // Attempt to register as Faculty
    const rejectFacultyRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hacker_faculty_${timestamp}@univ.edu`,
        password: 'Password123!',
        first_name: 'Fake',
        last_name: 'Faculty',
        role: 'FACULTY',
        department_id: 1
      })
    });
    assert(
      rejectFacultyRes.status === 403,
      `Attempted Faculty public registration rejected with HTTP 403`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Valid Student Public Registration with Unique RegNo
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Student Public Registration with Registration Number...');
    const studentEmail = `student_${timestamp}@univ.edu`;
    const studentRegNo = `REG${timestamp.toString().slice(-6)}`;
    
    const regStudentRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: 'Password123!',
        first_name: 'Test',
        last_name: 'Student',
        role: 'STUDENT',
        department_id: 1, // Computer Science
        registration_number: studentRegNo,
        section: 'A',
        year: 3
      })
    });
    const regStudentData = await regStudentRes.json();
    assert(
      regStudentRes.status === 201 && regStudentData.success === true && regStudentData.data?.token,
      `Student registration succeeded (User ID: ${regStudentData.data?.user?.user_id}, Assigned Mentor ID: ${regStudentData.data?.user?.mentor_id || 'Auto-mapped'})`
    );

    const studentToken = regStudentData.data?.token;
    const studentUser = regStudentData.data?.user;

    // Test duplicate registration number rejection (HTTP 409)
    const duplicateRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `duplicate_${timestamp}@univ.edu`,
        password: 'Password123!',
        first_name: 'Duplicate',
        last_name: 'Student',
        role: 'STUDENT',
        department_id: 1,
        registration_number: studentRegNo,
        section: 'A',
        year: 3
      })
    });
    assert(
      duplicateRegRes.status === 409,
      `Duplicate registration number properly rejected with HTTP 409 Conflict`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Admin Login & Staff Account Provisioning
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Admin Login & Dynamic Staff Account Creation...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@institution.edu', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success === true && adminLoginData.data?.token, 'Admin logged in successfully');
    const adminToken = adminLoginData.data?.token;

    // Admin creates a new Mentor
    const mentorEmail = `mentor_${timestamp}@univ.edu`;
    const mentorEmpId = `EMP-MTR-${timestamp.toString().slice(-4)}`;
    const createMentorRes = await fetch(`${API_BASE}/admin/users/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        first_name: 'Dr. Vikram',
        last_name: 'Sharma',
        email: mentorEmail,
        employee_id: mentorEmpId,
        role: 'MENTOR',
        department_id: 1,
        designation: 'Associate Professor',
        assigned_sections: ['A', 'B'],
        academic_year: '2025-26',
        assigned_responsibilities: 'Class Mentor for 3rd Year Sections A & B'
      })
    });
    const createMentorData = await createMentorRes.json();
    assert(
      createMentorRes.status === 201 && createMentorData.success === true,
      `Admin successfully created Mentor account (Emp ID: ${mentorEmpId})`
    );
    const mentorTempPassword = createMentorData.data?.tempPassword || createMentorData.data?.credentials?.temporary_password;
    assert(
      Boolean(mentorTempPassword),
      `Cryptographically secure temporary password generated: "${mentorTempPassword}"`
    );

    const mentorUserId = createMentorData.data?.user?.user_id;

    // Admin creates an Office Staff account
    const officeStaffEmail = `transport_${timestamp}@univ.edu`;
    const createOfficeRes = await fetch(`${API_BASE}/admin/users/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        first_name: 'Manoj',
        last_name: 'Kumar',
        email: officeStaffEmail,
        employee_id: `EMP-OFF-${timestamp.toString().slice(-4)}`,
        role: 'OFFICE_STAFF',
        office_id: 1, // Transport Office
        assigned_responsibilities: 'Bus pass verification and vehicle gate clearance'
      })
    });
    const createOfficeData = await createOfficeRes.json();
    assert(
      createOfficeRes.status === 201 && createOfficeData.success === true,
      `Admin successfully created Office Staff account for Transport Office`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Staff First-Login & Mandatory Password Change
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Staff First-Login & Mandatory Password Change Enforcement...');
    const mentorLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mentorEmail, password: mentorTempPassword })
    });
    const mentorLoginData = await mentorLoginRes.json();
    assert(
      mentorLoginData.success === true && mentorLoginData.data?.must_change_password === true,
      `Staff logged in with temporary password; must_change_password flag is correctly TRUE`
    );
    const mentorToken = mentorLoginData.data?.token;

    // Call /api/auth/change-password
    const newMentorPassword = 'PermanentPass2026!';
    const changePassRes = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mentorToken}`
      },
      body: JSON.stringify({
        old_password: mentorTempPassword,
        new_password: newMentorPassword
      })
    });
    const changePassData = await changePassRes.json();
    assert(
      changePassRes.status === 200 && changePassData.success === true,
      `Mandatory password change executed successfully`
    );

    // Re-login with new password
    const reLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mentorEmail, password: newMentorPassword })
    });
    const reLoginData = await reLoginRes.json();
    assert(
      reLoginData.success === true && reLoginData.data?.must_change_password === false,
      `Staff logged in with new permanent password; must_change_password is now FALSE`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Connected End-to-End Approval Workflow Routing
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Connected End-to-End Approval Workflow (Student -> Mentor -> Faculty -> HOD)...');
    
    // Step 5.1: Student submits permission request
    const submitAppRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        request_type: 'OD',
        reason: 'Selected to represent our university at the National Smart India Hackathon Grand Finale in Bangalore.',
        start_date: '2026-11-20',
        end_date: '2026-11-22',
        is_urgent: 1
      })
    });
    const submitAppData = await submitAppRes.json();
    assert(
      submitAppRes.status === 201 && submitAppData.success === true,
      `Student successfully submitted OD request (Code: ${submitAppData.data?.request_code}, ID: ${submitAppData.data?.request_id})`
    );
    const createdRequestId = submitAppData.data?.request_id;
    const createdRequestCode = submitAppData.data?.request_code;

    // Step 5.2: Mentor reviews and approves
    // We log in as the newly provisioned mentor (who was assigned to Sections A & B in Test 3)
    const mentorReviewerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mentorEmail, password: newMentorPassword })
    });
    const mentorReviewerLoginData = await mentorReviewerLoginRes.json();
    const mentorReviewerToken = mentorReviewerLoginData.data?.token;

    // Check mentor's pending queue
    const mentorQueueRes = await fetch(`${API_BASE}/requests/pending`, {
      headers: { 'Authorization': `Bearer ${mentorReviewerToken}` }
    });
    const mentorQueueData = await mentorQueueRes.json();
    const foundInMentorQueue = mentorQueueData.data?.find(r => r.request_id === createdRequestId);
    assert(
      Boolean(foundInMentorQueue),
      `Application appeared in Mentor's pending verification queue (Step 1)`
    );

    // Mentor approves
    const mentorActionRes = await fetch(`${API_BASE}/requests/${createdRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mentorReviewerToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Attendance is 90%. Academic performance is exceptional. Recommended for SIH Grand Finale.'
      })
    });
    const mentorActionData = await mentorActionRes.json();
    assert(
      mentorActionRes.status === 200 && mentorActionData.success === true,
      `Mentor verified and approved application. Forwarded to Faculty (Step 2)`
    );

    // Step 5.3: Faculty reviews and approves
    const facultyLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty.cse@institution.edu', password: 'password123' })
    });
    const facultyLoginData = await facultyLoginRes.json();
    const facultyToken = facultyLoginData.data?.token;

    const facultyQueueRes = await fetch(`${API_BASE}/requests/pending`, {
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });
    const facultyQueueData = await facultyQueueRes.json();
    const foundInFacultyQueue = facultyQueueData.data?.find(r => r.request_id === createdRequestId);
    assert(
      Boolean(foundInFacultyQueue),
      `Application successfully routed and appeared in Faculty Coordinator pending queue (Step 2)`
    );

    // Faculty approves
    const facultyActionRes = await fetch(`${API_BASE}/requests/${createdRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Internal lab exams rescheduled for following Monday. Sanction recommended.'
      })
    });
    assert(
      facultyActionRes.status === 200,
      `Faculty Coordinator approved application. Forwarded to HOD for final sanction (Step 3)`
    );

    // Step 5.4: HOD Sanction & Gate Pass Generation
    const hodLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hod.cse@institution.edu', password: 'password123' })
    });
    const hodLoginData = await hodLoginRes.json();
    const hodToken = hodLoginData.data?.token;

    const hodQueueRes = await fetch(`${API_BASE}/requests/pending`, {
      headers: { 'Authorization': `Bearer ${hodToken}` }
    });
    const hodQueueData = await hodQueueRes.json();
    const foundInHodQueue = hodQueueData.data?.find(r => r.request_id === createdRequestId);
    assert(
      Boolean(foundInHodQueue),
      `Application successfully routed to HOD Final Sanction Desk (Step 3)`
    );

    // HOD grants final sanction
    const hodActionRes = await fetch(`${API_BASE}/requests/${createdRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hodToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Official institutional OD granted. Digital gate pass generated with QR verification.'
      })
    });
    const hodActionData = await hodActionRes.json();
    assert(
      hodActionRes.status === 200 && hodActionData.success === true,
      `HOD granted final institutional sanction`
    );

    // Step 5.5: Student verifies final sanctioned status & gate pass
    const trackRes = await fetch(`${API_BASE}/requests/track/${createdRequestId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const trackData = await trackRes.json();
    const reqInfo = trackData.data?.request || trackData.data;
    assert(
      reqInfo?.overall_status === 'APPROVED',
      `Student tracking endpoint reports overall_status is APPROVED`
    );
    assert(
      Boolean(reqInfo?.pdf_letter_url),
      `Official digital gate pass PDF generated: "${reqInfo?.pdf_letter_url}"`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Strict Role-Based Access Control and Authorization
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Strict Access Control & Scoping Boundaries...');
    
    // Create Student B
    const studentBEmail = `student_b_${timestamp}@univ.edu`;
    const regStudentBRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentBEmail,
        password: 'Password123!',
        first_name: 'Student',
        last_name: 'B',
        role: 'STUDENT',
        department_id: 1,
        registration_number: `REGB${timestamp.toString().slice(-5)}`,
        section: 'B',
        year: 2
      })
    });
    const regStudentBData = await regStudentBRes.json();
    const studentBToken = regStudentBData.data?.token;

    // Student B attempts to access Student A's application tracking details
    const unauthorizedTrackRes = await fetch(`${API_BASE}/requests/track/${createdRequestId}`, {
      headers: { 'Authorization': `Bearer ${studentBToken}` }
    });
    assert(
      unauthorizedTrackRes.status === 403,
      `Student B blocked from tracking Student A's request with HTTP 403 Forbidden`
    );

    // Student attempts to call Admin API
    const unauthorizedAdminCall = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(
      unauthorizedAdminCall.status === 403,
      `Student blocked from Admin user management endpoint with HTTP 403 Forbidden`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Database Audit Trail Persistence
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Audit Trail Verification...');
    const auditRes = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json();
    assert(
      auditRes.status === 200 && Array.isArray(auditData.data) && auditData.data.length > 0,
      `Audit logs retrieved from database (Total events logged: ${auditData.data?.length})`
    );

    console.log('\n========================================================================');
    console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('💥 Test execution error:', err);
    process.exit(1);
  }
}

runTestSuite();
