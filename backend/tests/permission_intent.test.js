/**
 * Permission Intent Validation Agent - Automated Test Suite
 * 
 * Tests the 10 Golden Validation Rules, Groq LPU API integration,
 * classification contract compliance, and edge cases.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const PermissionIntentAgent = require('../src/agents/permissionIntentAgent');
const PermissionIntentService = require('../src/services/permissionIntent.service');

async function runTests() {
  console.log('================================================================');
  console.log('🤖 PERMISSION INTENT VALIDATION AGENT - VERIFICATION SUITE');
  console.log('================================================================');
  console.log(`Using Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(`Groq Key Configured: ${Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)}`);
  console.log('----------------------------------------------------------------\n');

  const testCases = [
    {
      id: 1,
      title: 'National Hackathon Attendance',
      subject: 'OD for National Hackathon',
      reason: 'I need OD to attend a 36-hour national hackathon organized by XYZ University.',
      expected: 'VALID_PERMISSION_REQUEST',
      expectedValid: true
    },
    {
      id: 2,
      title: 'Class Bunking Request',
      subject: 'Permission for today',
      reason: "I want to bunk today's class.",
      expected: 'INVALID_PERMISSION_INTENT',
      expectedValid: false
    },
    {
      id: 3,
      title: 'Medical Appointment Leave',
      subject: 'Medical Consultation',
      reason: 'I need leave for a medical appointment with my doctor.',
      expected: 'VALID_PERMISSION_REQUEST',
      expectedValid: true
    },
    {
      id: 4,
      title: 'Vague Reluctance / Absenteeism',
      subject: 'Leave',
      reason: "I don't want to attend college.",
      expected: ['INVALID_PERMISSION_INTENT', 'NEEDS_CLARIFICATION'],
      expectedValid: false
    },
    {
      id: 5,
      title: 'Technical Cloud Workshop',
      subject: 'Cloud Computing Workshop Permission',
      reason: 'I am requesting permission to attend a hands-on workshop on Cloud Computing.',
      expected: 'VALID_PERMISSION_REQUEST',
      expectedValid: true
    },
    {
      id: 6,
      title: 'Circumventing Lectures to Hang Out Outside',
      subject: 'OD Request for Lecture Hours',
      reason: 'Give me OD so that I can skip lectures and spend time outside.',
      expected: 'INVALID_PERMISSION_INTENT',
      expectedValid: false
    },
    {
      id: 7,
      title: 'Important Personal Reason at Home',
      subject: 'Leave for Family Emergency',
      reason: 'I need leave due to an important personal reason at home.',
      expected: 'VALID_PERMISSION_REQUEST',
      expectedValid: true
    },
    {
      id: 8,
      title: 'Ambiguous Event Request Without Details',
      subject: 'Event Permission',
      reason: 'I want permission to attend an event.',
      expected: 'NEEDS_CLARIFICATION',
      expectedValid: false
    },
    {
      id: 9,
      title: 'Edge Case: Empty or Insufficient Input',
      subject: '',
      reason: '',
      expected: 'NEEDS_CLARIFICATION',
      expectedValid: false
    },
    {
      id: 10,
      title: 'Edge Case: Colloquial Slang Bunking with Typos',
      subject: 'need od',
      reason: 'plz give od i wanna bunk lecture and chill with friends',
      expected: 'INVALID_PERMISSION_INTENT',
      expectedValid: false
    },
    {
      id: 11,
      title: 'Edge Case: Supplementary Internal Lab Exam',
      subject: 'Internal Lab Exam Permission',
      reason: 'Requesting permission to attend internal lab exam re-sit and clearance practicals.',
      expected: 'VALID_PERMISSION_REQUEST',
      expectedValid: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    process.stdout.write(`[Test ${tc.id.toString().padStart(2, '0')}] ${tc.title.padEnd(46, '.')}: `);
    const start = Date.now();

    try {
      const res = await PermissionIntentService.validateIntent({
        subject: tc.subject,
        reason: tc.reason,
        request_type: 'OD'
      });

      const elapsed = Date.now() - start;

      // Check contract fields
      const hasContractFields =
        typeof res.valid === 'boolean' &&
        typeof res.classification === 'string' &&
        typeof res.confidence === 'number' &&
        typeof res.reason === 'string' &&
        typeof res.message === 'string' &&
        typeof res.requires_clarification === 'boolean';

      const matchesExpectedClassification = Array.isArray(tc.expected)
        ? tc.expected.includes(res.classification)
        : res.classification === tc.expected;

      const matchesExpectedValid = res.valid === tc.expectedValid;

      if (hasContractFields && matchesExpectedClassification && matchesExpectedValid) {
        console.log(`✅ PASSED (${elapsed}ms) -> [${res.classification}] conf: ${(res.confidence * 100).toFixed(0)}%`);
        passed++;
      } else {
        console.log(`❌ FAILED (${elapsed}ms)`);
        console.log(`   Expected: classification=${JSON.stringify(tc.expected)}, valid=${tc.expectedValid}`);
        console.log(`   Received: classification=${res.classification}, valid=${res.valid}, reason="${res.reason}"`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (Total ${testCases.length})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
