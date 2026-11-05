const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runGroqTests() {
  console.log('====================================================');
  console.log('GROQ AI-POWERED ROUTING & OFFICES TEST SUITE');
  console.log('Model: openai/gpt-oss-120b (Ultra-Fast LPU Inference)');
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
    // 1. Auth as Student and Admin
    const studentAuth = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'student1@institution.edu', password: 'password123' }
    );
    const studentToken = studentAuth.data.data.token;

    const adminAuth = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@institution.edu', password: 'password123' }
    );
    const adminToken = adminAuth.data.data.token;

    const officeAuth = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'office.exam@institution.edu', password: 'password123' }
    );
    assert(officeAuth.status === 200 && officeAuth.data.data.user.role === 'OFFICE_ADMIN', 'Office Administrator login successful');
    const officeToken = officeAuth.data.data.token;

    // 2. University Offices API
    console.log('\n[1] Testing University Offices Directory...');
    const officesRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/offices',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(officesRes.status === 200 && Array.isArray(officesRes.data.data), 'GET /api/offices returns registered offices');
    assert(officesRes.data.data.length >= 9, 'All 9 official university offices registered');

    // 3. Register New Office (Admin)
    console.log('\n[2] Testing Office Registration...');
    const officeCode = 'PLACEMENT_CELL_' + Date.now().toString().slice(-4);
    const newOffice = await request(
      { hostname: 'localhost', port: 5000, path: '/api/offices', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` } },
      {
        name: 'Placement & Career Guidance Cell',
        code: officeCode,
        category: 'Corporate Relations & Placements',
        description: 'Campus interviews, internship NOCs, and off-campus drive permissions.',
        responsible_officer: 'Dr. S. K. Murthy (Dean of Training & Placement)',
        contact_email: 'placements@institution.edu',
        contact_phone: '+91 863 2344799',
        location: 'Placement Bhavan - Room 101',
        supported_permission_types: ['Campus Drive Attendance OD', 'Internship NOC Endorsement']
      }
    );
    assert(newOffice.status === 201 && newOffice.data.data.office_id, 'Admin can dynamically register a new university office');

    // 4. Test AI Routing: Exam & Fee Scenario
    console.log('\n[3] Testing Groq AI Routing on Exam & Fee Request...');
    const examReq = await request(
      { hostname: 'localhost', port: 5000, path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` } },
      {
        request_type: 'EXAM',
        reason: 'I have not paid my semester examination fee due to a financial issue. I need permission to attend the upcoming examination.',
        start_date: '2026-11-20',
        end_date: '2026-11-21'
      }
    );
    assert(examReq.status === 201 && examReq.data.data.requestId, 'Student submitted Exam & Fee request');
    const examReqId = examReq.data.data.requestId;

    const examAIRouting = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${examReqId}/ai-routing`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(examAIRouting.status === 200 && examAIRouting.data.data.classification, 'AI Routing details returned');
    const examOffice = examAIRouting.data.data.office_assignment?.office_name;
    assert(examOffice?.includes('Exam') || examOffice?.includes('Finance'), `AI accurately assigned request to Examination Cell or Finance Office (Assigned: ${examOffice})`);
    assert(examAIRouting.data.data.classification.confidence >= 0.70, `High confidence score: ${examAIRouting.data.data.classification.confidence}`);

    // 5. Test AI Routing: Hostel Outing Scenario
    console.log('\n[4] Testing Groq AI Routing on Hostel Outing Request...');
    const hostelReq = await request(
      { hostname: 'localhost', port: 5000, path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` } },
      {
        request_type: 'LEAVE',
        reason: 'I want permission to go home this weekend from the hostel.',
        start_date: '2026-11-14',
        end_date: '2026-11-16'
      }
    );
    const hostelReqId = hostelReq.data.data.requestId;

    const hostelAIRouting = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${hostelReqId}/ai-routing`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const hostelOffice = hostelAIRouting.data.data.office_assignment?.office_name;
    assert(hostelOffice?.includes('Hostel'), `AI accurately routed hostel outing to Hostel Office (Assigned: ${hostelOffice})`);

    // 6. Test AI Routing: Sports Scenario
    console.log('\n[5] Testing Groq AI Routing on Sports Request...');
    const sportsReq = await request(
      { hostname: 'localhost', port: 5000, path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` } },
      {
        request_type: 'OD',
        reason: 'I need permission to participate in the All India Inter-University athletic meet in New Delhi.',
        start_date: '2026-11-22',
        end_date: '2026-11-26'
      }
    );
    const sportsReqId = sportsReq.data.data.requestId;

    const sportsAIRouting = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${sportsReqId}/ai-routing`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const sportsOffice = sportsAIRouting.data.data.office_assignment?.office_name;
    assert(sportsOffice?.includes('Sport'), `AI accurately routed athletic request to Sports Department (Assigned: ${sportsOffice})`);

    // 7. Test Ambiguity Detection & Clarification Loop
    console.log('\n[6] Testing AI Clarification Engine on Ambiguous Request...');
    const vagueReq = await request(
      { hostname: 'localhost', port: 5000, path: '/api/requests', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` } },
      {
        request_type: 'LEAVE',
        reason: 'I need permission for tomorrow.',
        start_date: '2026-11-06',
        end_date: '2026-11-06'
      }
    );
    const vagueReqId = vagueReq.data.data.requestId;

    const vagueAIRouting = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/requests/${vagueReqId}/ai-routing`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const isClarification = vagueAIRouting.data.data.classification?.requires_clarification;
    assert(isClarification === true || isClarification === 1, 'AI flagged vague request as requires_clarification = true');
    assert(Boolean(vagueAIRouting.data.data.classification?.clarification_question), `AI generated clarification question: "${vagueAIRouting.data.data.classification?.clarification_question}"`);

    // 8. Test Student Submitting Clarification
    console.log('\n[7] Testing Student Clarification Submission & Re-Classification...');
    const clarifyAction = await request(
      { hostname: 'localhost', port: 5000, path: `/api/requests/${vagueReqId}/clarify`, method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` } },
      {
        response_text: 'I need night leave permission to visit my home from the hostel for a family function.'
      }
    );
    assert(clarifyAction.status === 200, 'Student successfully submitted clarification');
    assert(clarifyAction.data.data.assignedOffice?.name?.includes('Hostel') || clarifyAction.data.data.assignedOffice?.name?.includes('Department'), `Re-classified after clarification (Assigned: ${clarifyAction.data.data.assignedOffice?.name})`);

    // 9. Test Office Dashboard Applications View & Actions
    console.log('\n[8] Testing Office Dashboard Applications Queue & Actions...');
    const officeDeskRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/offices/1',
      method: 'GET',
      headers: { Authorization: `Bearer ${officeToken}` }
    });
    assert(officeDeskRes.status === 200 && officeDeskRes.data.data.office, 'Office Admin can view incoming routed applications queue');

    // Office action: ACCEPT
    const acceptAction = await request(
      { hostname: 'localhost', port: 5000, path: '/api/offices/1/action', method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${officeToken}` } },
      {
        request_id: examReqId,
        action: 'ACCEPT',
        remarks: 'Exam permission application accepted by Examination Cell desk for verification.'
      }
    );
    assert(acceptAction.status === 200, 'Office Admin accepted application for processing');

    // 10. Test Admin AI Statistics
    console.log('\n[9] Testing Admin AI Routing Analytics...');
    const aiStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/ai-stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(aiStats.status === 200, 'Admin AI stats return registered offices count');
    assert(aiStats.data.data.total_ai_classified >= 3, 'Admin AI stats record classified requests count');
    assert(Array.isArray(aiStats.data.data.office_distribution), 'Admin AI stats return office distribution');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

runGroqTests();
