/**
 * Complete End-to-End Test Suite for QR-Based Digital Permission Pass,
 * Real-Time Verification API, and Administrative Revocation System
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const API_BASE = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🚀 RUNNING VERIFICATION SUITE: QR DIGITAL PERMISSION PASS & SCANNER API');
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
    // STEP 1: Authenticate Student
    // -------------------------------------------------------------------------
    console.log('[STEP 1] Logging in as student (student1@institution.edu)...');
    const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student1@institution.edu', password: 'password123' })
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginData.success, 'Student login succeeded');
    const studentToken = studentLoginData.data?.token;
    const studentUserId = studentLoginData.data?.user?.user_id || studentLoginData.data?.user?.userId;

    // -------------------------------------------------------------------------
    // STEP 2: Authenticate Reviewers (Mentor, Faculty, HOD, Admin)
    // -------------------------------------------------------------------------
    console.log('[STEP 2] Logging in reviewers...');
    
    // Mentor
    const mentorLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mentor.cse@institution.edu', password: 'password123' })
    });
    const mentorLoginData = await mentorLoginRes.json();
    assert(mentorLoginData.success, 'Mentor login succeeded');
    const mentorToken = mentorLoginData.data?.token;

    // Faculty Coordinator
    const facLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty.cse@institution.edu', password: 'password123' })
    });
    const facLoginData = await facLoginRes.json();
    assert(facLoginData.success, 'Faculty coordinator login succeeded');
    const facToken = facLoginData.data?.token;

    // Head of Department (HOD)
    const hodLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hod.cse@institution.edu', password: 'password123' })
    });
    const hodLoginData = await hodLoginRes.json();
    assert(hodLoginData.success, 'HOD login succeeded');
    const hodToken = hodLoginData.data?.token;

    // Super Admin
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@institution.edu', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success, 'Super Admin login succeeded');
    const adminToken = adminLoginData.data?.token;

    // -------------------------------------------------------------------------
    // STEP 3: Student Submits On-Duty (OD) Permission Request
    // -------------------------------------------------------------------------
    console.log('\n[STEP 3] Submitting new OD permission request...');
    const today = new Date();
    const nextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];

    const submitRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        request_type: 'OD',
        reason: `National Autonomous Robotics Hackathon Grand Finale ${timestamp}. Representing university robotics division.`,
        start_date: startDate,
        end_date: endDate,
        is_urgent: 1
      })
    });
    const submitData = await submitRes.json();
    assert(submitData.success, `Permission request submitted: ${submitData.data?.request_code}`);
    const newRequestId = submitData.data?.request_id;
    const newRequestCode = submitData.data?.request_code;

    // -------------------------------------------------------------------------
    // STEP 4: Complete Multi-Tier Workflow to Final Approval
    // -------------------------------------------------------------------------
    console.log('\n[STEP 4] Executing connected multi-tier approval workflow...');

    // Stage 1: Academic Mentor Review
    const mentorReviewRes = await fetch(`${API_BASE}/requests/${newRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mentorToken}`
      },
      body: JSON.stringify({
        action: 'VERIFIED',
        remarks: 'Attendance record 89%. Highly recommended for national finals.'
      })
    });
    const mentorReviewData = await mentorReviewRes.json();
    assert(mentorReviewData.success, 'Stage 1: Mentor verified request');

    // Stage 2: Faculty Coordinator Review
    const facReviewRes = await fetch(`${API_BASE}/requests/${newRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Internal lab exam clash rescheduled. Approved to proceed to HOD.'
      })
    });
    const facReviewData = await facReviewRes.json();
    assert(facReviewData.success, 'Stage 2: Faculty approved request');

    // Stage 3: HOD Final Sanction
    const hodReviewRes = await fetch(`${API_BASE}/requests/${newRequestId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hodToken}`
      },
      body: JSON.stringify({
        action: 'APPROVED',
        remarks: 'Institutional sanction granted. Official digital pass generated.'
      })
    });
    const hodReviewData = await hodReviewRes.json();
    assert(hodReviewData.success, 'Stage 3: HOD final sanction granted');
    assert(hodReviewData.data?.status === 'APPROVED', 'Overall status reached APPROVED');

    // -------------------------------------------------------------------------
    // STEP 5: Verify Automatic Pass Generation & Student Retrieval
    // -------------------------------------------------------------------------
    console.log('\n[STEP 5] Verifying automatic digital pass generation...');
    const myPermsRes = await fetch(`${API_BASE}/permission-passes/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const myPermsData = await myPermsRes.json();
    assert(myPermsData.success, 'Student retrieved My Permissions list');

    const createdPerm = myPermsData.data?.permissions?.find(p => p.request_id === newRequestId);
    assert(!!createdPerm, 'Newly approved request exists in My Permissions');
    assert(!!createdPerm?.pass_reference, `Pass Reference automatically generated: ${createdPerm?.pass_reference}`);
    assert(!!createdPerm?.qr_code_data, 'High-resolution QR code Data URL automatically generated');
    assert(createdPerm?.pass_status === 'ACTIVE', 'Digital Pass status is ACTIVE');

    const passRef = createdPerm?.pass_reference;
    const passId = createdPerm?.pass_id;

    // -------------------------------------------------------------------------
    // STEP 6: Verify Pass Details Endpoint & Privacy Scoping
    // -------------------------------------------------------------------------
    console.log('\n[STEP 6] Testing single pass details retrieval...');
    const passDetailsRes = await fetch(`${API_BASE}/permission-passes/details/${passRef}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passDetailsData = await passDetailsRes.json();
    assert(passDetailsData.success, 'Retrieved pass details successfully');
    assert(passDetailsData.data?.request_code === newRequestCode, 'Pass details match requested application code');
    assert(Array.isArray(passDetailsData.data?.approval_history), 'Approval audit history included');

    // -------------------------------------------------------------------------
    // STEP 7: Real-Time Unauthenticated Public Scan
    // -------------------------------------------------------------------------
    console.log('\n[STEP 7] Testing real-time verification (Unauthenticated Public Camera Scan)...');
    const publicScanRes = await fetch(`${API_BASE}/permission-passes/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass_reference: passRef })
    });
    const publicScanData = await publicScanRes.json();
    assert(publicScanData.success, 'Public verification API responded successfully');
    assert(publicScanData.data?.status === 'APPROVED AND VALID', 'Public scan confirms pass is APPROVED AND VALID');
    assert(publicScanData.data?.requires_login_for_details === true, 'Public scan correctly masks sensitive student identity');
    assert(publicScanData.data?.pass_reference === passRef, 'Pass reference verified');

    // -------------------------------------------------------------------------
    // STEP 8: Real-Time Authenticated Staff Verification
    // -------------------------------------------------------------------------
    console.log('\n[STEP 8] Testing real-time verification (Authenticated Staff Scanner)...');
    const staffScanRes = await fetch(`${API_BASE}/permission-passes/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facToken}`
      },
      body: JSON.stringify({ pass_reference: passRef })
    });
    const staffScanData = await staffScanRes.json();
    assert(staffScanData.success, 'Staff verification API responded successfully');
    assert(staffScanData.data?.status === 'APPROVED AND VALID', 'Staff scan confirms status APPROVED AND VALID');
    assert(!!staffScanData.data?.student_name, `Staff scanner unlocked student identity: ${staffScanData.data?.student_name}`);
    assert(staffScanData.data?.verified_by_role === 'FACULTY', 'Verified by role recorded as FACULTY');

    // -------------------------------------------------------------------------
    // STEP 9: Admin Management, Analytics & Audit History
    // -------------------------------------------------------------------------
    console.log('\n[STEP 9] Testing Admin Pass Management & Scan Analytics...');
    const adminListRes = await fetch(`${API_BASE}/permission-passes/admin/list?search=${passRef}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminListData = await adminListRes.json();
    assert(adminListData.success, 'Admin listed passes');
    assert(adminListData.data?.items?.length > 0, 'Admin found pass by search query');
    assert(adminListData.data?.items[0]?.scan_count >= 2, `Scan count recorded in DB (scans: ${adminListData.data?.items[0]?.scan_count})`);

    const analyticsRes = await fetch(`${API_BASE}/permission-passes/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.success, 'Admin retrieved scan analytics');
    assert(analyticsData.data?.passes?.total_passes > 0, `Total passes in analytics: ${analyticsData.data?.passes?.total_passes}`);
    assert(analyticsData.data?.scans?.total_scans > 0, `Total scans logged: ${analyticsData.data?.scans?.total_scans}`);

    // Check pass scan history
    const historyRes = await fetch(`${API_BASE}/permission-passes/admin/${passId}/history`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const historyData = await historyRes.json();
    assert(historyData.success, 'Admin retrieved pass scan history');
    assert(historyData.data?.length >= 2, `Scan history contains ${historyData.data?.length} audit log entries`);

    // -------------------------------------------------------------------------
    // STEP 10: Admin Pass Revocation with Mandatory Reason
    // -------------------------------------------------------------------------
    console.log('\n[STEP 10] Testing Admin Pass Revocation...');
    
    // Revocation without reason should fail
    const failRevokeRes = await fetch(`${API_BASE}/permission-passes/admin/${passId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ reason: '   ' })
    });
    assert(failRevokeRes.status === 400, 'Blank revocation reason properly rejected with HTTP 400');

    // Valid revocation
    const revokeRes = await fetch(`${API_BASE}/permission-passes/admin/${passId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Event rescheduled to next semester by organizing committee.'
      })
    });
    const revokeData = await revokeRes.json();
    assert(revokeData.success, 'Admin successfully revoked pass');
    assert(revokeData.data?.status === 'REVOKED', 'Pass status updated to REVOKED');

    // -------------------------------------------------------------------------
    // STEP 11: Real-Time Re-Verification of Revoked Pass
    // -------------------------------------------------------------------------
    console.log('\n[STEP 11] Verifying that subsequent scans immediately flag REVOKED status...');
    const reVerifyRes = await fetch(`${API_BASE}/permission-passes/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mentorToken}`
      },
      body: JSON.stringify({ pass_reference: passRef })
    });
    const reVerifyData = await reVerifyRes.json();
    assert(reVerifyData.success, 'Re-verification API responded');
    assert(reVerifyData.data?.status === 'REVOKED', 'Verification immediately returned REVOKED');
    assert(reVerifyData.data?.message?.includes('Event rescheduled'), 'Revocation reason included in alert message');

    // -------------------------------------------------------------------------
    // STEP 12: Invalid QR / Tampered Token Testing
    // -------------------------------------------------------------------------
    console.log('\n[STEP 12] Testing Invalid QR / Tampered Token Handling...');
    const invalidScanRes = await fetch(`${API_BASE}/permission-passes/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass_reference: 'PASS-FAKE-000000' })
    });
    const invalidScanData = await invalidScanRes.json();
    assert(invalidScanData.data?.status === 'INVALID QR', 'Fake pass reference correctly returned INVALID QR');

    // -------------------------------------------------------------------------
    // STEP 13: Student Privacy & Access Control (Another Student Forbidden)
    // -------------------------------------------------------------------------
    console.log('\n[STEP 13] Testing Student Access Control (Privacy Boundary)...');
    const student2LoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.varma@institution.edu', password: 'password123' })
    });
    const student2LoginData = await student2LoginRes.json();
    const student2Token = student2LoginData.data?.token;

    // Student 2 attempts to fetch Student 1's pass details
    const unauthorizedPassRes = await fetch(`${API_BASE}/permission-passes/details/${passRef}`, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });
    assert(unauthorizedPassRes.status === 403, 'Unauthorized student access blocked with HTTP 403 Forbidden');

    // -------------------------------------------------------------------------
    // STEP 14: Pending and Rejected Applications
    // -------------------------------------------------------------------------
    console.log('\n[STEP 14] Testing Pending & Rejected Workflows...');
    const rejectReqRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        request_type: 'LEAVE',
        reason: 'Personal leave for family trip.',
        start_date: startDate,
        end_date: endDate
      })
    });
    const rejectReqData = await rejectReqRes.json();
    const rejectReqId = rejectReqData.data?.request_id;

    // Mentor rejects this request
    const mentorRejectRes = await fetch(`${API_BASE}/requests/${rejectReqId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mentorToken}`
      },
      body: JSON.stringify({
        action: 'REJECTED',
        remarks: 'Exam revision week. Non-medical leaves cannot be granted.'
      })
    });
    const mentorRejectData = await mentorRejectRes.json();
    assert(mentorRejectData.data?.status === 'REJECTED', 'Mentor rejected request successfully');

    // Verify rejection shows in student's My Permissions
    const studentPermsAfterReject = await fetch(`${API_BASE}/permission-passes/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentPermsData = await studentPermsAfterReject.json();
    const foundRejected = studentPermsData.data?.permissions?.find(p => p.request_id === rejectReqId);
    assert(foundRejected?.overall_status === 'REJECTED', 'Rejected request logged in student permissions');
    assert(!foundRejected?.pass_reference, 'No digital pass generated for rejected request');

    // -------------------------------------------------------------------------
    // STEP 15: Idempotency & Duplicate Approval Resilience
    // -------------------------------------------------------------------------
    console.log('\n[STEP 15] Testing Idempotent Pass Generation...');
    const PassGeneratorService = require('../src/services/passGenerator.service');
    const idempotentPass = await PassGeneratorService.generatePassForRequest(newRequestId);
    assert(idempotentPass.pass_reference === passRef, 'Pass generator returned identical pass reference (no duplicate rows)');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(`📊 TEST SUITE COMPLETE: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Test suite fatal error:', err);
    process.exit(1);
  }
}

runTestSuite();
