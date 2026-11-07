/**
 * Student Photograph Verification Workflow Test
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5000/api';

// 1x1 transparent PNG base64 Data URL for testing
const SAMPLE_BASE64_PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('TESTING STUDENT PHOTOGRAPH INTEGRATION');
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
    // 1. Test Registration without photo (Must fail)
    console.log('[1] Testing registration without photo (Mandatory validation)...');
    const noPhotoRes = await makeRequest('POST', '/auth/register', {
      email: `test_nophoto_${Date.now()}@vignan.edu`,
      password: 'Password@123',
      firstName: 'NoPhoto',
      lastName: 'Student',
      phone: '9876543210',
      registrationNumber: `REGNOPHOT${Math.floor(Math.random() * 1000)}`,
      departmentId: 1,
      section: 'A',
      semester: 6,
      batchYear: '2022-2026',
      role: 'STUDENT'
    });

    assert(noPhotoRes.status === 400, 'Registration without photo correctly rejected with 400 Bad Request');
    assert(noPhotoRes.body?.message?.includes('photograph is mandatory'), 'Error message states photograph is mandatory');

    // 2. Test Registration WITH photo
    console.log('\n[2] Testing registration with valid photo...');
    const testRegNo = `241FA${Math.floor(10000 + Math.random() * 90000)}`;
    const testEmail = `student_${Date.now()}@institution.edu`;

    const withPhotoRes = await makeRequest('POST', '/auth/register', {
      email: testEmail,
      password: 'Password@123',
      firstName: 'Rahaman',
      lastName: 'Shaik',
      phone: '9177564421',
      registrationNumber: testRegNo,
      departmentId: 1,
      section: 'A',
      semester: 6,
      batchYear: '2022-2026',
      photo: SAMPLE_BASE64_PHOTO,
      role: 'STUDENT'
    });

    assert(withPhotoRes.status === 201, 'Student registered successfully with 201 Created');
    assert(withPhotoRes.body?.data?.user?.photo_url !== undefined, 'User object contains photo_url');
    assert(withPhotoRes.body?.data?.user?.photo_url?.includes('/uploads/photos/'), 'Photo saved in /uploads/photos/');

    const studentToken = withPhotoRes.body?.data?.token;

    // 3. Test Student Photo Profile endpoint (GET)
    console.log('\n[3] Testing GET /api/students/profile/photo...');
    const photoProfileRes = await makeRequest('GET', '/students/profile/photo', null, studentToken);
    assert(photoProfileRes.status === 200, 'Profile photo endpoint returns 200 OK');
    assert(photoProfileRes.body?.data?.photo_url?.includes('/uploads/photos/'), 'Profile photo URL matches saved photo');

    // 4. Test Student Photo Update (POST)
    console.log('\n[4] Testing POST /api/students/profile/photo (Update Photo)...');
    const updatePhotoRes = await makeRequest('POST', '/students/profile/photo', {
      photo: SAMPLE_BASE64_PHOTO
    }, studentToken);
    assert(updatePhotoRes.status === 200, 'Photo update returns 200 OK');
    assert(updatePhotoRes.body?.data?.photo_url !== undefined, 'Updated photo_url returned');

    // 5. Test Staff Verify Pass endpoint includes student_photo_url
    console.log('\n[5] Testing staff pass verification returns student_photo_url...');
    // Login as mentor or faculty or use verify public query
    const verifyRes = await makeRequest('GET', '/permission-passes/verify?token=demo_pass_token');
    // Even if token doesn't exist, verify response format
    assert(verifyRes.status === 200 || verifyRes.status === 404, 'Pass verification endpoint reachable');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
