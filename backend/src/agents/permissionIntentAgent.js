/**
 * Permission Intent Validation Agent
 * 
 * Determines whether a student's permission request has a legitimate university-related purpose
 * before allowing the application to enter the institutional approval workflow.
 * 
 * Reuses the existing Groq API service and configuration (openai/gpt-oss-120b).
 */

const logger = require('../utils/logger');

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

class PermissionIntentAgent {
  /**
   * System prompt codifying the 10 Golden Validation Rules
   */
  static getSystemPrompt() {
    return `You are the university's "Permission Intent Validation Agent".
Your sole responsibility is to analyze student permission applications and determine whether the stated purpose is legitimate and acceptable for entering the university approval workflow.

You must follow these 10 Golden Validation Rules strictly:

RULE 1 (Legitimate Academic & Co-curricular Activities):
A request to attend a hackathon, coding competition, technical event, workshop, seminar, conference, symposium, industrial visit, or athletic tournament MUST be considered a legitimate permission purpose (VALID_PERMISSION_REQUEST).

RULE 2 (Legitimate Leave Requests):
Medical leave, sickness, doctor appointments, hospitalization, personal leave for family commitments, family emergencies, bereavement, or legitimate travel MUST be considered valid leave requests (VALID_PERMISSION_REQUEST). Do NOT block them simply because the student will miss classes.

RULE 3 (Block Avoidance & Bunking):
A request whose stated intention is simply to avoid attending classes, skip lectures, bunk periods, sleep in, hang out with friends, go to movies, or stay outside campus without a legitimate permission reason MUST be blocked as INVALID_PERMISSION_INTENT.
Examples to block:
- "I want to bunk today's class."
- "I don't want to attend classes."
- "Give me OD because I want to skip lectures."
- "I want permission to stay outside college without any valid reason."
- "I am bored, so I don't want to attend class."
- "I want to skip my classes for no reason."
- "Going to chill with friends during lecture hours."

RULE 4 (Context Over Keywords):
Do NOT classify using superficial keywords alone. Understand the complete sentence, semantics, tone, and full intent. For instance:
- "I need OD to attend a hackathon" -> VALID_PERMISSION_REQUEST
- "Give me OD so that I can skip lectures and spend time outside" -> INVALID_PERMISSION_INTENT
Even though both contain "OD", their actual intent is completely different.

RULE 5 (Natural Language & Informal Phrasing):
Understand student slang, colloquial phrasing ("bunk", "skip", "ditch", "chill"), typos, and diverse sentence structures. Do not let students bypass validation by altering capitalization, punctuation, or sentence structure.

RULE 6 (Ambiguity & Missing Details):
If the request is too vague, ambiguous, or lacks critical details to understand what the student wants permission for, classify as NEEDS_CLARIFICATION rather than invalid.
Examples needing clarification:
- "I want permission to attend an event." (No event name, organizer, or details specified)
- "I don't want to attend college." (No reason provided—could be sick or could be avoiding class)
- "I need permission for tomorrow." (No purpose given)

RULE 7 (Objective & Professional Tone):
Validate the purpose of the application objectively. Do not lecture, insult, or judge the student's character.

RULE 8 (Output Schema):
You MUST return ONLY a valid JSON object strictly conforming to this schema:
{
  "valid": true | false,
  "classification": "VALID_PERMISSION_REQUEST" | "INVALID_PERMISSION_INTENT" | "NEEDS_CLARIFICATION",
  "confidence": 0.95,
  "reason": "Clear explanation of why this classification was assigned.",
  "message": "Polite, helpful message for the student.",
  "requires_clarification": true | false
}

CLASSIFICATION CONTRACT:
1. VALID_PERMISSION_REQUEST: valid = true, requires_clarification = false
2. INVALID_PERMISSION_INTENT: valid = false, requires_clarification = false
3. NEEDS_CLARIFICATION: valid = false, requires_clarification = true`;
  }

  /**
   * Calls Groq REST API using ultra-fast LPU inference and structured JSON response format
   */
  static async callGroq(prompt, model = PRIMARY_MODEL) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is not configured in backend environment.');
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned empty response content.');
    }

    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    return JSON.parse(content);
  }

  /**
   * Heuristic Intent Classifier (Guarantees 100% uptime and instant zero-latency validation during network/quota hiccups)
   */
  static heuristicClassification(subject = '', description = '', requestType = '') {
    const combined = `${subject} ${description}`.toLowerCase().trim();

    // 1. Check for empty or excessively short input
    if (combined.length < 8) {
      return {
        valid: false,
        classification: 'NEEDS_CLARIFICATION',
        confidence: 0.90,
        reason: 'The permission request contains insufficient details to evaluate purpose.',
        message: 'Please provide a clear subject and description for your permission request.',
        requires_clarification: true
      };
    }

    // 2. Clear invalid intent: bunking / skipping without legitimate reason
    const invalidPatterns = [
      /\b(bunk|bunking|bunked)\b/,
      /\bskip\s+(class|classes|lecture|lectures|period|periods|college|lab)\b/,
      /\b(don'?t|do\s+not)\s+want\s+to\s+attend\s+(class|classes|lecture|lectures|college|lab)\b/,
      /\b(bored|sleep|relax|chill|hang\s*out|party|movie|shopping|sleep\s+in)\s+(so|and|instead|because)/,
      /\bavoid\s+(attending|classes|lectures|college)\b/,
      /\b(skip|skipping)\s+lectures?\s+and\s+spend\s+time\s+outside\b/,
      /\bwithout\s+any\s+(valid\s+)?reason\b/,
      /\bfor\s+no\s+(valid\s+)?reason\b/,
      /\bjust\s+want\s+to\s+(roam|stay\s+outside|chill)\b/
    ];

    const hasInvalidPattern = invalidPatterns.some((pattern) => pattern.test(combined));
    if (hasInvalidPattern) {
      return {
        valid: false,
        classification: 'INVALID_PERMISSION_INTENT',
        confidence: 0.96,
        reason: 'The stated purpose is simply to avoid attending classes without a legitimate permission-related reason.',
        message: 'Your request appears to be intended to avoid attending classes rather than to obtain legitimate university permission. Please enter a valid permission-related purpose before submitting your application.',
        requires_clarification: false
      };
    }

    // 3. Clear valid legitimate permission indicators
    const validEventPatterns = [
      /\b(hackathon|hack\s*day|ideathon|datathon)\b/,
      /\b(symposium|conference|seminar|webinar|conclave)\b/,
      /\b(workshop|training|bootcamp|hands-on)\b/,
      /\b(competition|contest|tournament|championship|match|olympiad)\b/,
      /\b(paper\s+presentation|project\s+presentation|poster\s+presentation)\b/,
      /\b(ieee|acm|csi|iste|gdg|rotaract)\b/
    ];

    const validLeavePatterns = [
      /\b(medical|doctor|hospital|clinic|prescription|fever|sick|illness|surgery|appointment|dental|treatment|health)\b/,
      /\b(family\s+function|marriage|wedding|funeral|bereavement|emergency|urgent\s+personal|important\s+personal|hometown|native|festival)\b/,
      /\b(passport|visa|interview|driving\s+license|govt|government\s+exam|upsc|gate|gre)\b/
    ];

    const validAcademicPatterns = [
      /\b(exam|examination|hall\s*ticket|re-sit|practical|internal\s+exam|lab\s+exam|supplementary|backlog|clearance|condonation)\b/,
      /\b(internship|industry\s+visit|placement|campus\s+drive|recruitment)\b/
    ];

    const isLegitEvent = validEventPatterns.some((p) => p.test(combined));
    const isLegitLeave = validLeavePatterns.some((p) => p.test(combined));
    const isLegitAcademic = validAcademicPatterns.some((p) => p.test(combined));

    if (isLegitEvent || isLegitLeave || isLegitAcademic) {
      return {
        valid: true,
        classification: 'VALID_PERMISSION_REQUEST',
        confidence: 0.95,
        reason: isLegitEvent
          ? 'The student has requested permission to participate in a verified university-related technical or co-curricular event.'
          : isLegitLeave
          ? 'The student has requested leave for a genuine medical or personal reason, subject to normal institutional approval.'
          : 'The student has requested permission for legitimate academic or examination-related purposes.',
        message: 'Your request has a valid institutional purpose and is eligible for submission.',
        requires_clarification: false
      };
    }

    // 4. Ambiguous or vague requests
    const vaguePatterns = [
      /\bpermission\s+(is\s+needed|for\s+tomorrow|needed)\b/i,
      /\bi\s+(want|need)\s+permission\b/i,
      /\battend\s+(an?\s+)?event\b/i,
      /\bdon'?t\s+want\s+to\s+attend\s+college\b/i,
      /\bwant\s+permission\s+to\s+attend\s+(an?\s+)?event\b/i,
      /\bjust\s+need\s+permission\b/i,
      /\bfor\s+some\s+work\b/i
    ];

    const isVague = vaguePatterns.some((p) => p.test(combined)) || combined.length < 25;
    if (isVague) {
      return {
        valid: false,
        classification: 'NEEDS_CLARIFICATION',
        confidence: 0.70,
        reason: 'The purpose of the request is not sufficiently clear or lacks specific context.',
        message: 'Please provide more details regarding your permission request (e.g. mention the event name, organization, medical context, or academic purpose).',
        requires_clarification: true
      };
    }

    // Default: If it has reasonable length and no bunking intent, treat as personal request subject to normal approval
    return {
      valid: true,
      classification: 'VALID_PERMISSION_REQUEST',
      confidence: 0.85,
      reason: 'The student has stated a general permission reason, eligible for review through the normal departmental approval workflow.',
      message: 'Your request is eligible for submission. You can continue.',
      requires_clarification: false
    };
  }

  /**
   * Main Agent Method: Validates student permission intent
   * 
   * @param {Object} params
   * @param {string} params.subject - Application Subject / Title
   * @param {string} params.reason - Detailed reason or description
   * @param {string} params.request_type - OD, LEAVE, EVENT, ACADEMIC, etc.
   * @param {string} [params.start_date] - Start date
   * @param {string} [params.end_date] - End date
   * @returns {Promise<Object>} Structured validation result
   */
  static async validateIntent({ subject = '', reason = '', request_type = 'OD', start_date = '', end_date = '' } = {}) {
    const cleanSubject = (subject || '').trim();
    const cleanReason = (reason || '').trim();
    const cleanType = (request_type || 'OD').toUpperCase().trim();

    // Fast-path: Check for missing or empty input before calling LLM
    if (!cleanSubject && !cleanReason) {
      return {
        valid: false,
        classification: 'NEEDS_CLARIFICATION',
        confidence: 0.95,
        reason: 'Subject and reason were not provided.',
        message: 'Please enter a clear subject and description for your permission request.',
        requires_clarification: true
      };
    }

    const promptText = `Analyze the following student permission application to validate its purpose and intent:

STUDENT APPLICATION DATA:
- Request Type / Category: ${cleanType}
- Application Subject / Title: "${cleanSubject}"
- Reason / Detailed Description: "${cleanReason}"
- Requested Validity Dates: ${start_date || 'N/A'} to ${end_date || 'N/A'}

Evaluate according to the 10 Golden Validation Rules:
1. Is this a legitimate university-related purpose (hackathons, competitions, workshops, conferences, medical reasons, personal leave, exam permissions)?
2. Is the student attempting to use the permission system simply to bunk classes, avoid lectures, or skip college without a legitimate reason?
3. Does the request have sufficient details, or is it ambiguous and in need of clarification?

Return ONLY a JSON object strictly matching this schema:
{
  "valid": true | false,
  "classification": "VALID_PERMISSION_REQUEST" | "INVALID_PERMISSION_INTENT" | "NEEDS_CLARIFICATION",
  "confidence": 0.95,
  "reason": "Detailed explanation of why this classification was assigned.",
  "message": "Student-facing response message.",
  "requires_clarification": false
}`;

    let aiResult = null;
    let modelUsed = PRIMARY_MODEL;

    // Try primary Groq model
    try {
      aiResult = await this.callGroq(promptText, PRIMARY_MODEL);
    } catch (err1) {
      logger.warn(`[PermissionIntentAgent] Primary model (${PRIMARY_MODEL}) failed: ${err1.message}. Attempting fallback (${FALLBACK_MODEL})...`);
      try {
        modelUsed = FALLBACK_MODEL;
        aiResult = await this.callGroq(promptText, FALLBACK_MODEL);
      } catch (err2) {
        logger.error(`[PermissionIntentAgent] Groq API unavailable (${err2.message}). Falling back to heuristic classifier.`);
        modelUsed = 'heuristic-engine';
        aiResult = this.heuristicClassification(cleanSubject, cleanReason, cleanType);
      }
    }

    // Normalize and sanitize the result contract
    return this.normalizeResult(aiResult, cleanSubject, cleanReason, cleanType);
  }

  /**
   * Enforces strict contract structure and data types on the AI response
   */
  static normalizeResult(raw, subject, reason, requestType) {
    if (!raw || typeof raw !== 'object') {
      return this.heuristicClassification(subject, reason, requestType);
    }

    let classification = String(raw.classification || '').toUpperCase().trim();
    const validClassifications = ['VALID_PERMISSION_REQUEST', 'INVALID_PERMISSION_INTENT', 'NEEDS_CLARIFICATION'];

    if (!validClassifications.includes(classification)) {
      if (raw.valid === false && raw.requires_clarification === true) {
        classification = 'NEEDS_CLARIFICATION';
      } else if (raw.valid === false) {
        classification = 'INVALID_PERMISSION_INTENT';
      } else {
        classification = 'VALID_PERMISSION_REQUEST';
      }
    }

    const valid = classification === 'VALID_PERMISSION_REQUEST';
    const requiresClarification = classification === 'NEEDS_CLARIFICATION';

    let confidence = parseFloat(raw.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
      confidence = 0.95;
    }

    let defaultMsg = '';
    if (classification === 'VALID_PERMISSION_REQUEST') {
      defaultMsg = 'Your request has a valid institutional purpose and is eligible for submission.';
    } else if (classification === 'INVALID_PERMISSION_INTENT') {
      defaultMsg = 'Your request appears to be intended to avoid attending classes rather than to obtain legitimate university permission. Please enter a valid permission-related purpose before submitting your application.';
    } else {
      defaultMsg = 'Please provide more details regarding your permission request (e.g. mention the event name, organization, medical context, or academic purpose).';
    }

    return {
      valid: valid,
      classification: classification,
      confidence: parseFloat(confidence.toFixed(2)),
      reason: raw.reason || 'Evaluated based on university permission policy guidelines.',
      message: raw.message || defaultMsg,
      requires_clarification: requiresClarification
    };
  }
}

module.exports = PermissionIntentAgent;
