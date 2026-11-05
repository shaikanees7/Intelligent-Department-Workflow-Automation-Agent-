const db = require('../../database/db');
const Notification = require('../models/Notification');
const { sendNotificationEmail } = require('./email.service');
const logger = require('../utils/logger');

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

class GeminiRoutingService {
  /**
   * Fetches active registered offices from MySQL
   */
  static async getActiveOffices() {
    const [rows] = await db.query(
      `SELECT office_id, name, code, category, responsible_officer, contact_email, supported_permission_types
       FROM university_offices
       WHERE is_active = TRUE
       ORDER BY office_id ASC`
    );
    return rows;
  }

  /**
   * Calls Groq REST API using ultra-fast LPU inference and structured JSON output
   */
  static async callGroqAPI(prompt, model = PRIMARY_MODEL) {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key not configured.');
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
          {
            role: 'system',
            content: 'You are the AI University Department and Office Routing Agent. Always output valid JSON conforming strictly to the requested schema.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Groq API HTTP ${res.status}: ${errBody.slice(0, 200)}`);
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
   * Alias for backward compatibility
   */
  static async callGeminiAPI(prompt, model = PRIMARY_MODEL) {
    return this.callGroqAPI(prompt, model);
  }

  static async callAI(prompt, model = PRIMARY_MODEL) {
    return this.callGroqAPI(prompt, model);
  }

  /**
   * Rule-based heuristic fallback classifier (guarantees 100% uptime during network/quota issues)
   */
  static heuristicClassification(text, activeOffices) {
    const lower = (text || '').toLowerCase();

    // Check keywords for each office
    let matchedCode = 'DEPT_OFFICE';
    let category = 'General Department Permission';
    let confidence = 0.85;
    let reason = 'Request pertains to academic department operations.';
    let requiresClarification = false;
    let clarificationQuestion = null;

    if (lower.length < 20 || lower === 'i need permission' || lower.includes('permission for tomorrow')) {
      requiresClarification = true;
      clarificationQuestion = 'Could you please specify the purpose of your permission? Is it related to examinations, fee clearance, hostel outing, sports, or another activity?';
      confidence = 0.40;
    } else if (lower.includes('exam') || lower.includes('hall ticket') || lower.includes('supplementary') || lower.includes('backlog') || lower.includes('grade') || lower.includes('re-sit')) {
      matchedCode = 'EXAM_CELL';
      category = 'Examination and Evaluation';
      reason = 'The request explicitly concerns examination clearance, lab practicals, or hall ticket approvals.';
      confidence = 0.95;
    } else if (lower.includes('fee') || lower.includes('tuition') || lower.includes('dues') || lower.includes('scholarship') || lower.includes('challan') || lower.includes('installment')) {
      matchedCode = 'FINANCE_OFFICE';
      category = 'Finance and Fee Accounts';
      reason = 'The request involves tuition payment, dues waiver, or financial clearance.';
      confidence = 0.94;
    } else if (lower.includes('hostel') || lower.includes('outing') || lower.includes('night leave') || lower.includes('room') || lower.includes('warden') || lower.includes('mess')) {
      matchedCode = 'HOSTEL_OFFICE';
      category = 'Hostel Outing & Residential';
      reason = 'The request concerns leaving the hostel temporarily, night outings, or residential accommodations.';
      confidence = 0.96;
    } else if (lower.includes('sport') || lower.includes('tournament') || lower.includes('match') || lower.includes('athlet') || lower.includes('gym')) {
      matchedCode = 'SPORTS_DEPT';
      category = 'Sports and Athletics';
      reason = 'The request relates to athletic tournaments, sports team travel, or gymnasium access.';
      confidence = 0.95;
    } else if (lower.includes('library') || lower.includes('book') || lower.includes('thesis') || lower.includes('plagiarism') || lower.includes('fine')) {
      matchedCode = 'LIBRARY';
      category = 'Library & Digital Resources';
      reason = 'The request involves library books, research repositories, or overdue fee adjustments.';
      confidence = 0.93;
    } else if (lower.includes('bus') || lower.includes('transport') || lower.includes('vehicle') || lower.includes('route') || lower.includes('parking')) {
      matchedCode = 'TRANSPORT_OFFICE';
      category = 'Transportation & Bus Services';
      reason = 'The request relates to institutional bus passes, route alterations, or vehicular access.';
      confidence = 0.92;
    } else if (lower.includes('fest') || lower.includes('club') || lower.includes('cultural') || lower.includes('hackathon') || lower.includes('symposium') || lower.includes('workshop')) {
      matchedCode = 'STUDENT_AFFAIRS';
      category = 'Student Affairs & Co-Curricular';
      reason = 'The request involves technical workshops, collegiate hackathons, or student club coordination.';
      confidence = 0.91;
    } else if (lower.includes('attendance') || lower.includes('condonation') || lower.includes('bonafide') || lower.includes('course')) {
      matchedCode = 'ACADEMIC_OFFICE';
      category = 'Academic Affairs';
      reason = 'The request concerns attendance condonation, course modifications, or institutional academic standing.';
      confidence = 0.90;
    }

    const primaryOffice = activeOffices.find(o => o.code === matchedCode) || activeOffices[0];

    return {
      permission_category: category,
      primary_office: primaryOffice ? primaryOffice.name : 'Department Office',
      secondary_offices: lower.includes('fee') && matchedCode === 'EXAM_CELL' ? ['Finance Office'] : [],
      reason,
      confidence,
      requires_clarification: requiresClarification,
      clarification_question: clarificationQuestion
    };
  }

  /**
   * Main method: Classifies and automatically routes a student permission request
   */
  static async classifyAndRoute(requestId, requestData) {
    const activeOffices = await this.getActiveOffices();
    if (activeOffices.length === 0) {
      logger.warn('[GeminiRouting] No active university offices registered.');
      return null;
    }

    const officesOverview = activeOffices.map(o => ({
      name: o.name,
      code: o.code,
      category: o.category,
      supported_permission_types: JSON.parse(o.supported_permission_types || '[]')
    }));

    const promptText = `
You are the AI University Department and Office Routing Agent for a higher education institution.
Analyze the following student permission application and classify which registered university office is responsible.

STUDENT REQUEST DETAILS:
- Request Code: ${requestData.request_code || 'N/A'}
- Request Category: ${requestData.request_type || 'N/A'}
- Student Reason / Justification: "${requestData.reason}"
- Duration: ${requestData.start_date} to ${requestData.end_date}

AVAILABLE REGISTERED UNIVERSITY OFFICES:
${JSON.stringify(officesOverview, null, 2)}

STRICT RULES:
1. "primary_office" MUST be the exact name of one of the registered offices listed above. Never invent an office name or ID.
2. If the request involves multiple jurisdictions (e.g. unpaid exam fee involves both Examination Cell and Finance Office), identify the primary office and list secondary offices in "secondary_offices".
3. If the request is vague, lacks details, or is too short (e.g. "I need permission for tomorrow" without stating why or what activity), set "requires_clarification": true and provide a courteous, specific "clarification_question".
4. Provide a confidence score between 0.00 and 1.00.
5. Provide a clear "reason" explaining why the selected office is relevant.

Return ONLY a JSON object matching this schema:
{
  "permission_category": "string",
  "primary_office": "Exact Registered Office Name",
  "secondary_offices": ["Secondary Office Name"],
  "reason": "Detailed explanation of why this office was selected",
  "confidence": 0.95,
  "requires_clarification": false,
  "clarification_question": null
}
`;

    let aiResult = null;
    let modelUsed = PRIMARY_MODEL;

    // Try Groq Primary Model (openai/gpt-oss-120b)
    try {
      aiResult = await this.callGroqAPI(promptText, PRIMARY_MODEL);
    } catch (err1) {
      logger.warn(`[GroqRouting] Primary Groq model (${PRIMARY_MODEL}) failed: ${err1.message}. Trying fallback ${FALLBACK_MODEL}...`);
      try {
        modelUsed = FALLBACK_MODEL;
        aiResult = await this.callGroqAPI(promptText, FALLBACK_MODEL);
      } catch (err2) {
        logger.error(`[GroqRouting] Groq API unavailable (${err2.message}). Activating intelligent heuristic fallback.`);
        modelUsed = 'heuristic-engine';
        aiResult = this.heuristicClassification(requestData.reason, activeOffices);
      }
    }

    // Validate that primary_office exists in active offices
    let matchedOffice = activeOffices.find(
      o => o.name.toLowerCase() === (aiResult.primary_office || '').toLowerCase() ||
           o.code.toLowerCase() === (aiResult.primary_office || '').toLowerCase()
    );

    if (!matchedOffice) {
      // Fuzzy substring match
      matchedOffice = activeOffices.find(o =>
        (aiResult.primary_office || '').toLowerCase().includes(o.name.toLowerCase()) ||
        o.name.toLowerCase().includes((aiResult.primary_office || '').toLowerCase())
      ) || activeOffices.find(o => o.code === 'DEPT_OFFICE') || activeOffices[0];
    }

    const confidence = parseFloat(aiResult.confidence) || 0.85;
    const requiresClarification = Boolean(aiResult.requires_clarification) || confidence < 0.65;
    const clarificationQuestion = aiResult.clarification_question ||
      (requiresClarification ? 'Could you please specify additional details regarding the purpose of your permission request?' : null);

    const routingStatus = requiresClarification
      ? 'CLARIFICATION_REQUESTED'
      : confidence < 0.75
      ? 'MANUAL_REVIEW_NEEDED'
      : 'ROUTED';

    // 1. Log AI Classification Record
    const [logRes] = await db.query(
      `INSERT INTO ai_classification_logs 
       (request_id, model_used, prompt_summary, raw_response, permission_category, suggested_primary_office, suggested_secondary_offices, reason, confidence, requires_clarification, clarification_question, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        modelUsed,
        `Classify request ${requestData.request_code}: "${(requestData.reason || '').slice(0, 100)}"`,
        JSON.stringify(aiResult),
        aiResult.permission_category || 'General Academic Permission',
        matchedOffice.name,
        JSON.stringify(aiResult.secondary_offices || []),
        aiResult.reason || 'Categorized based on institutional jurisdictional authority.',
        confidence,
        requiresClarification,
        clarificationQuestion,
        routingStatus
      ]
    );

    // 2. If clarification required, record into clarification_history
    if (requiresClarification && clarificationQuestion) {
      await db.query(
        `INSERT INTO clarification_history (request_id, question) VALUES (?, ?)`,
        [requestId, clarificationQuestion]
      );

      // Alert student that clarification is requested
      await Notification.create({
        user_id: requestData.student_user_id,
        request_id: requestId,
        title: `Clarification Needed: ${requestData.request_code}`,
        message: `Our AI Routing Agent needs clarification on your request: "${clarificationQuestion}". Please respond on your tracking page.`,
        type: 'REMINDER'
      });
    }

    // 3. Assign to Office
    await db.query(
      `INSERT INTO application_office_assignments (request_id, office_id, assigned_by, status, remarks)
       VALUES (?, ?, 'AI_ROUTING', 'PENDING', ?)
       ON DUPLICATE KEY UPDATE office_id = VALUES(office_id), status = 'PENDING', remarks = VALUES(remarks)`,
      [
        requestId,
        matchedOffice.office_id,
        `AI Automated Routing (${modelUsed}, Confidence: ${(confidence * 100).toFixed(1)}%). Reason: ${aiResult.reason || 'Jurisdictional match'}`
      ]
    );

    // 4. Notify Office Administrators
    const [staffRows] = await db.query(
      `SELECT u.user_id, u.email FROM office_staff os
       JOIN users u ON os.user_id = u.user_id
       WHERE os.office_id = ?`,
      [matchedOffice.office_id]
    );

    for (const staff of staffRows) {
      await Notification.create({
        user_id: staff.user_id,
        request_id: requestId,
        title: `New Application Routed to ${matchedOffice.name}`,
        message: `Application ${requestData.request_code} was categorized as "${aiResult.permission_category}" and routed to your office for verification.`,
        type: 'ASSIGNMENT'
      });

      sendNotificationEmail(
        staff.email,
        `New Routing Assignment: ${requestData.request_code} -> ${matchedOffice.name}`,
        `An application (${requestData.request_code}) has been routed to ${matchedOffice.name} by the University AI Routing Agent.\n\nCategory: ${aiResult.permission_category}\nExplanation: ${aiResult.reason}`
      );
    }

    logger.info(`[GeminiRouting] Request ${requestData.request_code} successfully classified as "${aiResult.permission_category}" and assigned to "${matchedOffice.name}" (Confidence: ${(confidence * 100).toFixed(1)}%).`);

    return {
      logId: logRes.insertId,
      assignedOffice: matchedOffice,
      classification: aiResult,
      confidence,
      routingStatus,
      requiresClarification,
      clarificationQuestion
    };
  }

  /**
   * Processes a student's clarification response and triggers re-classification
   */
  static async submitClarification(requestId, studentUserId, studentReply) {
    if (!studentReply || !studentReply.trim()) {
      throw new Error('Clarification reply cannot be empty.');
    }

    // Record reply in clarification_history
    await db.query(
      `UPDATE clarification_history 
       SET student_reply = ?, replied_at = NOW() 
       WHERE request_id = ? AND student_reply IS NULL 
       ORDER BY clarification_id DESC LIMIT 1`,
      [studentReply.trim(), requestId]
    );

    // Fetch original request details
    const [reqRows] = await db.query('SELECT * FROM permission_requests WHERE request_id = ?', [requestId]);
    if (reqRows.length === 0) throw new Error('Request not found.');

    const originalReq = reqRows[0];
    const combinedReason = `${originalReq.reason} [Student Clarification: ${studentReply.trim()}]`;

    // Re-classify with updated details
    const updatedReq = {
      ...originalReq,
      reason: combinedReason
    };

    const result = await this.classifyAndRoute(requestId, updatedReq);

    // Notify student that clarification was processed
    await Notification.create({
      user_id: studentUserId,
      request_id: requestId,
      title: `Clarification Received (${originalReq.request_code})`,
      message: `Your clarification was analyzed by AI. Application has been routed to ${result.assignedOffice.name}.`,
      type: 'FORWARDED'
    });

    return result;
  }

  /**
   * Manual override of office routing by Administrator
   */
  static async manualRoute(requestId, targetOfficeId, adminUserId, remarks = '') {
    const [officeRows] = await db.query('SELECT * FROM university_offices WHERE office_id = ? AND is_active = TRUE', [targetOfficeId]);
    if (officeRows.length === 0) throw new Error('Target office not found or is inactive.');

    const targetOffice = officeRows[0];

    // Update assignment
    await db.query(
      `INSERT INTO application_office_assignments (request_id, office_id, assigned_by, status, action_taken_by, remarks)
       VALUES (?, ?, 'ADMIN_MANUAL', 'PENDING', ?, ?)
       ON DUPLICATE KEY UPDATE office_id = VALUES(office_id), assigned_by = 'ADMIN_MANUAL', action_taken_by = VALUES(action_taken_by), remarks = VALUES(remarks), status = 'PENDING'`,
      [requestId, targetOfficeId, adminUserId, remarks || 'Manually routed by System Administrator.']
    );

    // Update AI log status
    await db.query(
      `UPDATE ai_classification_logs 
       SET status = 'OVERRIDDEN' 
       WHERE request_id = ? 
       ORDER BY log_id DESC LIMIT 1`,
      [requestId]
    );

    logger.info(`[GeminiRouting] Request ${requestId} manually overridden and assigned to ${targetOffice.name} by user ${adminUserId}.`);
    return { success: true, assignedOffice: targetOffice };
  }
}

module.exports = GeminiRoutingService;
