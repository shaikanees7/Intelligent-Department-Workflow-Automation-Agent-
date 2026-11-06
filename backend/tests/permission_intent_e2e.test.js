/**
 * End-to-End Test for Permission Intent Validation Agent & Server Enforcement
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../database/db');

const API_BASE = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('================================================================');
  console.log('🛡️ RUNNING E2E PERMISSION INTENT ENFORCEMENT & SERVER-SIDE TEST');
  console.log('================================================================');

  try {
    // 1. Authenticate as student
    console.log('\n[1] Authenticating as student (student@univ.edu)...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@univ.edu', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.data?.token) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.data.token;
    console.log('  ✅ Student authenticated successfully.');

    // 2. Test POST /api/requests/validate-intent with Invalid Intent
    console.log('\n[2] Testing POST /api/requests/validate-intent with invalid intent ("bunk today\'s class")...');
    const invalidValRes = await fetch(`${API_BASE}/requests/validate-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Bunking class',
        reason: "I want to bunk today's class."
      })
    });
    const invalidValData = await invalidValRes.json();
    console.log('  Status:', invalidValRes.status);
    console.log('  Result:', invalidValData.data?.classification);
    if (invalidValRes.status === 200 && invalidValData.data?.valid === false) {
      console.log('  ✅ PASS: Intent correctly identified as invalid pre-submission.');
    } else {
      throw new Error('Validate intent failed to reject invalid purpose.');
    }

    // 3. Test Server-side Enforcement: Attempt direct POST /api/requests with invalid intent
    console.log('\n[3] Testing Server-side Block on POST /api/requests with invalid intent...');
    const countBeforeRows = await db.query('SELECT COUNT(*) AS count FROM permission_requests');
    const countBefore = countBeforeRows[0][0].count;

    const invalidSubmitRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'Bunking class',
        reason: "I want to bunk today's class.",
        request_type: 'OD',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        registration_number: 'REG-2024-TEST',
        mobile_number: '+91 9999999999'
      })
    });

    const invalidSubmitData = await invalidSubmitRes.json();
    console.log('  HTTP Status:', invalidSubmitRes.status);
    console.log('  Message:', invalidSubmitData.message);
    console.log('  Classification:', invalidSubmitData.validation?.classification);

    const countAfterRows = await db.query('SELECT COUNT(*) AS count FROM permission_requests');
    const countAfter = countAfterRows[0][0].count;

    if (invalidSubmitRes.status === 422 && countBefore === countAfter) {
      console.log(`  ✅ PASS: HTTP 422 returned and MySQL database count UNCHANGED (${countBefore} -> ${countAfter}). Blocked request was NEVER persisted!`);
    } else {
      throw new Error(`Server enforcement failed: status=${invalidSubmitRes.status}, countBefore=${countBefore}, countAfter=${countAfter}`);
    }

    // 4. Test Valid Submission: POST /api/requests with legitimate hackathon OD
    console.log('\n[4] Testing Valid Submission on POST /api/requests with legitimate hackathon OD...');
    const validSubmitRes = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: 'National Smart India Hackathon Grand Finale',
        reason: 'Selected for National Smart India Hackathon Grand Finale 36-hour hackathon at IIT Madras. Requesting OD.',
        request_type: 'OD',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        registration_number: 'REG-2024-TEST',
        mobile_number: '+91 9999999999'
      })
    });

    const validSubmitData = await validSubmitRes.json();
    console.log('  HTTP Status:', validSubmitRes.status);
    console.log('  Request Code:', validSubmitData.data?.requestCode || validSubmitData.data?.request_code);

    const countFinalRows = await db.query('SELECT COUNT(*) AS count FROM permission_requests');
    const countFinal = countFinalRows[0][0].count;

    if (validSubmitRes.status === 201 && countFinal === countBefore + 1) {
      console.log(`  ✅ PASS: HTTP 201 returned and request persisted in MySQL with code: ${validSubmitData.data?.requestCode || validSubmitData.data?.request_code}`);
    } else {
      throw new Error(`Valid submission failed: status=${validSubmitRes.status}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL END-TO-END PERMISSION INTENT TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Test Failure:', err.message);
    process.exit(1);
  }
}

runE2ETest();
