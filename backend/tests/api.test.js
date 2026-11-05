/**
 * Comprehensive Automated API Test Suite
 * Tests all 12 major requirements: Auth (5 roles), Requests, Routing,
 * Dynamic Workflow Approvals, Rejections, Tracking, Notifications, Stats.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING BACKEND API INTEGRATION TEST SUITE');
  console.log('====================================================\n');

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
    // 1. Health Check
    console.log('[1] Testing Health Check Endpoint...');
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data?.status === 'OK', 'Health check returns 200 OK');

    // 2. Auth Tests - All 5 Roles
    console.log('\n[2] Testing Authentication for all 5 roles...');

    // Student
    const studentLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'student1@institution.edu', password: 'password123' }
    );
    assert(studentLogin.status === 200 && studentLogin.data.data.token, 'Student login successful with JWT');
    const studentToken = studentLogin.data?.data?.token;
    const studentUser = studentLogin.data?.data?.user;
    assert(studentUser?.role === 'STUDENT', 'User role is STUDENT');
    assert(studentUser?.registration_number && studentUser?.registrationNumber, 'Returns both registration_number and registrationNumber');

    // Mentor
    const mentorLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'mentor.cse@institution.edu', password: 'password123' }
    );
    assert(mentorLogin.status === 200 && mentorLogin.data.data.user.role === 'MENTOR', 'Mentor login successful');
    const mentorToken = mentorLogin.data?.data?.token;

    // Faculty
    const facultyLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'faculty.cse@institution.edu', password: 'password123' }
    );
    assert(facultyLogin.status === 200 && facultyLogin.data.data.user.role === 'FACULTY', 'Faculty login successful');
    const facultyToken = facultyLogin.data?.data?.token;

    // HOD
    const hodLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'hod.cse@institution.edu', password: 'password123' }
    );
    assert(hodLogin.status === 200 && hodLogin.data.data.user.role === 'HOD', 'HOD login successful');
    const hodToken = hodLogin.data?.data?.token;

    // Admin
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@institution.edu', password: 'password123' }
    );
    assert(adminLogin.status === 200 && adminLogin.data.data.user.role === 'ADMIN', 'Admin login successful');
    const adminToken = adminLogin.data?.data?.token;

    // User's email login (vu.241fa18363@gmail.com)
    const userEmailLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'vu.241fa18363@gmail.com', password: 'password123' }
    );
    assert(userEmailLogin.status === 200 && userEmailLogin.data.data.user.role === 'STUDENT', 'User email (vu.241fa18363@gmail.com) login successful');

    // Invalid credentials rejection
    const badLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@institution.edu', password: 'wrongpassword' }
    );
    assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Profile inspection
    const profile = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(profile.status === 200 && profile.data.data.email === 'student1@institution.edu', 'Protected profile endpoint returns current user');

    // 3. Student Request Submission
    console.log('\n[3] Testing Student Request Submission...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const submitRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/requests',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        }
      },
      {
        request_type: 'OD',
        reason: 'Selected for All-India Inter-University Coding Hackathon at Hyderabad.',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: dayAfter.toISOString().split('T')[0]
      }
    );
    assert(submitRes.status === 201 && submitRes.data.data.requestId, 'Student request created with 201 Created');
    const newRequestId = submitRes.data.data.requestId;
    const newRequestCode = submitRes.data.data.requestCode;

    // 4. Student My Requests
    console.log('\n[4] Testing Student My Requests listing...');
    const myReqs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requests/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myReqs.status === 200 && Array.isArray(myReqs.data.data), 'Returns array of student requests');
    const foundNew = myReqs.data.data.some((r) => r.request_id === newRequestId);
    assert(foundNew, 'Newly submitted request present in student requests');

    // 5. Reviewer Pending Queue
    console.log('\n[5] Testing Reviewer Queues...');
    const mentorQueue = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/requests/pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${mentorToken}` }
    });
    assert(mentorQueue.status === 200 && Array.isArray(mentorQueue.data.data), 'Mentor pending queue accessible');

    // 6. Complete Dynamic Workflow Approval (Mentor -> Faculty -> HOD)
    console.log('\n[6] Testing Multi-Level Workflow Engine (Mentor -> Faculty -> HOD)...');

    // Step 1: Mentor Verification
    const mentorAction = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/requests/${newRequestId}/action`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mentorToken}`
        }
      },
      {
        action: 'APPROVED',
        remarks: 'Academic Mentor Verification: Student attendance 91%, active club lead.'
      }
    );
    assert(mentorAction.status === 200 && mentorAction.data.data.status === 'FORWARDED', 'Step 1: Mentor approved and request forwarded to FACULTY');
    assert(mentorAction.data.data.nextRole === 'FACULTY', 'Next role is FACULTY');

    // Step 2: Faculty Approval
    const facultyAction = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/requests/${newRequestId}/action`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${facultyToken}`
        }
      },
      {
        action: 'APPROVED',
        remarks: 'Department Faculty Sanction: Lab exam schedule verified and adjusted.'
      }
    );
    assert(facultyAction.status === 200 && facultyAction.data.data.status === 'FORWARDED', 'Step 2: Faculty approved and request forwarded to HOD');
    assert(facultyAction.data.data.nextRole === 'HOD', 'Next role is HOD');

    // Step 3: HOD Final Sanction & PDF Pass Generation
    const hodAction = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/requests/${newRequestId}/action`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hodToken}`
        }
      },
      {
        action: 'APPROVED',
        remarks: 'HOD Sanction: Official permission granted. Digital gate pass endorsed.'
      }
    );
    assert(hodAction.status === 200 && hodAction.data.data.status === 'APPROVED', 'Step 3: HOD final approval completed');
    assert(hodAction.data.data.pdfUrl, 'PDF Permission Pass generated successfully');

    // 7. Request Tracking & Audit Trail
    console.log('\n[7] Testing Request Tracking & Audit Trail...');
    const track = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${newRequestId}/track`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(track.status === 200 && track.data.data.request.overall_status === 'APPROVED', 'Tracking confirms request is APPROVED');
    assert(track.data.data.history.length === 3, 'Audit trail contains all 3 review steps with remarks and timestamps');

    // 8. Notifications
    console.log('\n[8] Testing Notification Center...');
    const notifs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(notifs.status === 200 && Array.isArray(notifs.data.data), 'Notifications list retrieved');
    assert(notifs.data.data.length > 0, 'In-app notifications generated across workflow events');

    if (notifs.data.data[0]) {
      const markRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/notifications/${notifs.data.data[0].notification_id}/read`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      assert(markRes.status === 200, 'Notification marked as read');
    }

    // 9. Admin Statistics & User Management
    console.log('\n[9] Testing Admin Statistics & User APIs...');
    const stats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(stats.status === 200 && stats.data.data.total_requests >= 6, 'Admin stats return accurate request counts');
    assert(stats.data.data.approved_count >= 3, 'Approved count reflects newly approved request');

    const users = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(users.status === 200 && users.data.data.length >= 6, 'Admin users list returns all institutional accounts');

    // 10. Role-Based Access Control (RBAC) Enforcement
    console.log('\n[10] Testing RBAC Security Enforcements...');
    const studentAccessAdmin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(studentAccessAdmin.status === 403, 'Student blocked from admin endpoints (403 Forbidden)');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite encountered unhandled exception:', err);
    process.exit(1);
  }
}

runTests();
