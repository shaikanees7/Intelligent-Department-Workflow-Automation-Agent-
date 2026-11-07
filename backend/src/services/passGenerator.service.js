const crypto = require('crypto');
const QRCode = require('qrcode');
const db = require('../../database/db');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class PassGeneratorService {
  /**
   * Generates or retrieves an existing digital permission pass for an approved request.
   */
  static async generatePassForRequest(requestId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch request details
      const [reqRows] = await connection.query(`
        SELECT r.*, u.email AS student_email, u.first_name, u.last_name
        FROM permission_requests r
        JOIN users u ON r.student_user_id = u.user_id
        WHERE r.request_id = ? FOR UPDATE
      `, [requestId]);

      const request = reqRows[0];
      if (!request) {
        throw new Error(`Request #${requestId} not found.`);
      }

      if (request.overall_status !== 'APPROVED') {
        throw new Error(`Cannot generate digital pass: Request #${requestId} is not approved (current status: ${request.overall_status}).`);
      }

      // 2. Check if a pass already exists (idempotent check)
      const [existingPassRows] = await connection.query(`
        SELECT * FROM permission_passes WHERE request_id = ?
      `, [requestId]);

      if (existingPassRows.length > 0) {
        await connection.commit();
        logger.info(`[PassGenerator] Pass already exists for Request #${requestId}: ${existingPassRows[0].pass_reference}`);
        return existingPassRows[0];
      }

      // 3. Generate unique pass reference & cryptographic token
      const currentYear = new Date().getFullYear();
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const passReference = `PASS-${currentYear}-${randomSuffix}`;

      // Cryptographically secure 32-byte hex token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // 4. Construct verification URL and generate QR code
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-pass?ref=${passReference}&token=${rawToken}`;

      const qrCodeData = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 360,
        color: {
          dark: '#1e1b4b', // deep navy
          light: '#ffffff'
        }
      });

      // 5. Determine validity dates
      const validFrom = new Date(request.start_date).toISOString().split('T')[0];
      const validUntil = new Date(request.end_date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const initialStatus = validUntil < today ? 'EXPIRED' : 'ACTIVE';

      // 6. Insert record into permission_passes
      const [insertResult] = await connection.query(`
        INSERT INTO permission_passes 
        (request_id, pass_reference, verification_token_hash, qr_code_data, issued_at, valid_from, valid_until, status)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
      `, [
        requestId,
        passReference,
        tokenHash,
        qrCodeData,
        validFrom,
        validUntil,
        initialStatus
      ]);

      const passId = insertResult.insertId;
      await connection.commit();

      // 7. Notify student that their Digital Permission Pass is available
      try {
        await Notification.create({
          user_id: request.student_user_id,
          request_id: requestId,
          title: `Digital Permission Pass Generated! (${passReference})`,
          message: `Your verified digital pass (${passReference}) for request ${request.request_code} is now ready in your "My Permissions" section. You can present this QR pass to authorized campus staff.`,
          type: 'APPROVAL'
        });
      } catch (notifErr) {
        logger.error(`[PassGenerator] Failed to create notification for student #${request.student_user_id}: ${notifErr.message}`);
      }

      logger.info(`[PassGenerator] Successfully generated pass ${passReference} (ID: ${passId}) for Request #${requestId}`);

      return {
        pass_id: passId,
        request_id: requestId,
        pass_reference: passReference,
        qr_code_data: qrCodeData,
        valid_from: validFrom,
        valid_until: validUntil,
        status: initialStatus,
        verification_url: verificationUrl
      };
    } catch (err) {
      await connection.rollback();
      logger.error(`[PassGenerator] Error generating pass for request #${requestId}: ${err.message}`);
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Retrieves all permission requests and associated digital passes for a student.
   */
  static async getStudentPermissions(studentUserId) {
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(`
      SELECT 
        r.request_id,
        r.request_code,
        r.request_type,
        r.reason,
        r.start_date,
        r.end_date,
        r.is_urgent,
        r.current_step_order,
        r.current_reviewer_role,
        r.overall_status,
        r.pdf_letter_url,
        r.created_at AS submission_date,
        r.updated_at AS last_updated,
        u.first_name,
        u.last_name,
        s.registration_number,
        s.section,
        s.photo_url,
        s.photo_updated_at,
        d.name AS department_name,
        d.code AS department_code,
        p.pass_id,
        p.pass_reference,
        p.qr_code_data,
        p.issued_at AS pass_issued_at,
        p.valid_from AS pass_valid_from,
        p.valid_until AS pass_valid_until,
        p.status AS pass_status,
        p.revoked_at,
        p.revocation_reason
      FROM permission_requests r
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN permission_passes p ON r.request_id = p.request_id
      WHERE r.student_user_id = ?
      ORDER BY r.created_at DESC
    `, [studentUserId]);

    // Compute dynamic pass status (if valid_until is past, mark as EXPIRED)
    const permissions = rows.map(item => {
      let dynamicPassStatus = item.pass_status;
      if (item.pass_status === 'ACTIVE' && item.pass_valid_until) {
        const untilStr = new Date(item.pass_valid_until).toISOString().split('T')[0];
        if (untilStr < today) {
          dynamicPassStatus = 'EXPIRED';
        }
      }

      return {
        ...item,
        pass_status: dynamicPassStatus
      };
    });

    // Compute live statistics
    const stats = {
      total: permissions.length,
      approved: permissions.filter(p => p.overall_status === 'APPROVED').length,
      pending: permissions.filter(p => ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(p.overall_status)).length,
      rejected: permissions.filter(p => p.overall_status === 'REJECTED').length,
      activePasses: permissions.filter(p => p.pass_status === 'ACTIVE').length,
      expiredPasses: permissions.filter(p => p.pass_status === 'EXPIRED').length,
      revokedPasses: permissions.filter(p => p.pass_status === 'REVOKED').length
    };

    return { permissions, stats };
  }

  /**
   * Retrieves single pass details for viewing/printing.
   */
  static async getPassDetails(passReferenceOrId, requesterUser) {
    const isNumeric = /^\d+$/.test(passReferenceOrId);
    const queryField = isNumeric ? 'p.pass_id' : 'p.pass_reference';

    const [rows] = await db.query(`
      SELECT 
        p.*,
        r.request_code,
        r.request_type,
        r.reason,
        r.start_date,
        r.end_date,
        r.overall_status,
        r.created_at AS request_created_at,
        r.pdf_letter_url,
        u.user_id AS student_user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.email AS student_email,
        s.registration_number,
        s.section,
        s.semester,
        s.batch_year,
        s.photo_url,
        s.photo_updated_at,
        d.name AS department_name,
        d.code AS department_code,
        rev.first_name AS revoker_first_name,
        rev.last_name AS revoker_last_name
      FROM permission_passes p
      JOIN permission_requests r ON p.request_id = r.request_id
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN users rev ON p.revoked_by = rev.user_id
      WHERE ${queryField} = ?
    `, [passReferenceOrId]);

    const pass = rows[0];
    if (!pass) return null;

    // Student privacy check: A student can only view their own pass
    if (requesterUser && requesterUser.role === 'STUDENT' && requesterUser.userId !== pass.student_user_id) {
      throw new Error('Unauthorized access: You cannot view another student\'s permission pass.');
    }

    // Dynamic expiry evaluation
    const today = new Date().toISOString().split('T')[0];
    const untilStr = new Date(pass.valid_until).toISOString().split('T')[0];
    if (pass.status === 'ACTIVE' && untilStr < today) {
      pass.status = 'EXPIRED';
    }

    // Fetch approval stages history
    const [historyRows] = await db.query(`
      SELECT h.*, CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name, u.role AS reviewer_role
      FROM approval_history h
      JOIN users u ON h.reviewer_user_id = u.user_id
      WHERE h.request_id = ?
      ORDER BY h.step_order ASC, h.action_timestamp ASC
    `, [pass.request_id]);

    pass.approval_history = historyRows;
    return pass;
  }

  /**
   * Real-time verification of a permission pass.
   * Can be invoked with token or pass_reference.
   */
  static async verifyPass({ passReference, token, scannedByUser = null, ipAddress = null }) {
    if (!passReference && !token) {
      return {
        status: 'INVALID QR',
        message: 'We could not verify this permission pass. Please check the QR code or contact the university administration.'
      };
    }

    let pass = null;

    // 1. Find by passReference
    if (passReference) {
      const [rows] = await db.query(`
        SELECT p.*, r.request_code, r.request_type, r.reason, r.start_date, r.end_date, r.overall_status,
               u.user_id AS student_user_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
               s.registration_number, s.section, s.photo_url, d.name AS department_name
        FROM permission_passes p
        JOIN permission_requests r ON p.request_id = r.request_id
        JOIN users u ON r.student_user_id = u.user_id
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE p.pass_reference = ?
      `, [passReference]);
      pass = rows[0];
    }

    // 2. Token authenticity check if token is provided
    if (pass && token) {
      const computedHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
      if (computedHash !== pass.verification_token_hash) {
        // Record scan with INVALID QR
        await this._recordScan(pass.pass_id, scannedByUser?.userId, 'INVALID QR', ipAddress, 'Token hash mismatch');
        return {
          status: 'INVALID QR',
          message: 'We could not verify this permission pass. The verification security token does not match institutional records.'
        };
      }
    }

    if (!pass) {
      return {
        status: 'INVALID QR',
        message: 'We could not verify this permission pass. Please check the QR code or contact the university administration.'
      };
    }

    // 3. Determine real-time verification outcome
    let verificationResult = 'APPROVED AND VALID';
    let resultMessage = 'This digital permission pass is verified, authentic, and actively approved.';

    const today = new Date().toISOString().split('T')[0];
    const untilStr = new Date(pass.valid_until).toISOString().split('T')[0];

    if (pass.status === 'REVOKED') {
      verificationResult = 'REVOKED';
      resultMessage = pass.revocation_reason 
        ? `This digital permission pass has been revoked. Reason: ${pass.revocation_reason}`
        : 'This digital permission pass has been revoked. Contact the concerned university authority.';
    } else if (pass.overall_status === 'REJECTED') {
      verificationResult = 'REJECTED';
      resultMessage = 'This permission application was rejected through the authorized approval process.';
    } else if (pass.overall_status !== 'APPROVED') {
      verificationResult = 'PENDING';
      resultMessage = 'This application has not completed its approval process. A valid digital permission pass is not currently available.';
    } else if (untilStr < today) {
      verificationResult = 'EXPIRED';
      resultMessage = 'The validity period of this digital permission pass has ended.';
    }

    // 4. Record the scan event in permission_pass_scans
    await this._recordScan(
      pass.pass_id,
      scannedByUser?.userId || null,
      verificationResult,
      ipAddress,
      `Scanned via ${scannedByUser ? scannedByUser.role : 'Public Link'}`
    );

    // 5. Scoped response: Full detail for authenticated staff; minimal for unauthenticated public scans
    const isStaff = scannedByUser && ['ADMIN', 'HOD', 'FACULTY', 'MENTOR', 'OFFICE_ADMIN', 'OFFICE_STAFF'].includes(scannedByUser.role);

    if (isStaff) {
      return {
        status: verificationResult,
        message: resultMessage,
        student_name: pass.student_name,
        registration_number: pass.registration_number,
        student_photo_url: pass.photo_url || null,
        photo_url: pass.photo_url || null,
        department: pass.department_name,
        section: pass.section,
        permission_type: pass.request_type,
        purpose: pass.reason,
        validity_period: `${new Date(pass.valid_from).toLocaleDateString()} to ${new Date(pass.valid_until).toLocaleDateString()}`,
        valid_from: pass.valid_from,
        valid_until: pass.valid_until,
        application_reference: pass.request_code,
        pass_reference: pass.pass_reference,
        issued_at: pass.issued_at,
        scanned_at: new Date().toISOString(),
        verified_by_role: scannedByUser.role,
        requires_login_for_details: false
      };
    } else {
      // Unauthenticated public mobile scan result
      return {
        status: verificationResult,
        message: resultMessage,
        pass_reference: pass.pass_reference,
        permission_type: pass.request_type,
        validity_period: `${new Date(pass.valid_from).toLocaleDateString()} to ${new Date(pass.valid_until).toLocaleDateString()}`,
        application_reference: pass.request_code,
        note: 'For complete student identity verification and departmental approval trail, log in as authorized university staff.',
        requires_login_for_details: true
      };
    }
  }

  /**
   * Internal helper to record a scan into permission_pass_scans.
   */
  static async _recordScan(passId, scannedByUserId, verificationResult, ipAddress, notes) {
    try {
      await db.query(`
        INSERT INTO permission_pass_scans (pass_id, scanned_by, verification_result, ip_address, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [passId, scannedByUserId, verificationResult, ipAddress, notes]);
    } catch (err) {
      logger.error(`[PassGenerator] Failed to record scan log: ${err.message}`);
    }
  }

  /**
   * Revoke an active digital permission pass (Administrator only).
   */
  static async revokePass({ passId, passReference, adminUserId, reason }) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('A mandatory revocation reason must be provided.');
    }

    const isNumeric = /^\d+$/.test(passId || passReference);
    const queryField = isNumeric ? 'pass_id' : 'pass_reference';
    const queryVal = passId || passReference;

    const [rows] = await db.query(`
      SELECT p.*, r.request_code, r.student_user_id
      FROM permission_passes p
      JOIN permission_requests r ON p.request_id = r.request_id
      WHERE ${queryField} = ?
    `, [queryVal]);

    const pass = rows[0];
    if (!pass) {
      throw new Error('Digital permission pass not found.');
    }

    if (pass.status === 'REVOKED') {
      throw new Error(`Pass ${pass.pass_reference} is already revoked.`);
    }

    // Update status to REVOKED
    await db.query(`
      UPDATE permission_passes 
      SET status = 'REVOKED', 
          revoked_at = NOW(), 
          revoked_by = ?, 
          revocation_reason = ? 
      WHERE pass_id = ?
    `, [adminUserId, reason.trim(), pass.pass_id]);

    // Send in-app notification to student
    try {
      await Notification.create({
        user_id: pass.student_user_id,
        request_id: pass.request_id,
        title: `Digital Pass Revoked (${pass.pass_reference})`,
        message: `Your digital permission pass for request ${pass.request_code} has been revoked by the administration. Reason: "${reason.trim()}". Please contact the Dean or Department Head.`,
        type: 'REJECTION'
      });
    } catch (notifErr) {
      logger.error(`[PassGenerator] Notification error on pass revocation: ${notifErr.message}`);
    }

    // Log in audit_logs if table exists
    try {
      await db.query(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (?, 'REVOKE_PASS', 'PERMISSION_PASS', ?, ?)
      `, [adminUserId, pass.pass_reference, JSON.stringify({ reason: reason.trim() })]);
    } catch (auditErr) {
      // Non-fatal
    }

    logger.info(`[PassGenerator] Pass ${pass.pass_reference} revoked by admin user #${adminUserId}. Reason: ${reason}`);

    return {
      pass_id: pass.pass_id,
      pass_reference: pass.pass_reference,
      status: 'REVOKED',
      revocation_reason: reason.trim(),
      revoked_at: new Date().toISOString()
    };
  }

  /**
   * Administrative pass list with search, filtering, and scan counts.
   */
  static async listAdminPasses({ search = '', departmentId = '', category = '', status = '', page = 1, limit = 15 }) {
    const offset = (page - 1) * limit;
    const whereClauses = [];
    const params = [];

    if (search && search.trim() !== '') {
      whereClauses.push('(s.registration_number LIKE ? OR r.request_code LIKE ? OR p.pass_reference LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
      const wild = `%${search.trim()}%`;
      params.push(wild, wild, wild, wild, wild);
    }

    if (departmentId) {
      whereClauses.push('u.department_id = ?');
      params.push(departmentId);
    }

    if (category) {
      whereClauses.push('r.request_type = ?');
      params.push(category);
    }

    if (status) {
      if (status === 'EXPIRED') {
        whereClauses.push('(p.status = "EXPIRED" OR (p.status = "ACTIVE" AND p.valid_until < CURDATE()))');
      } else if (status === 'ACTIVE') {
        whereClauses.push('(p.status = "ACTIVE" AND p.valid_until >= CURDATE())');
      } else {
        whereClauses.push('p.status = ?');
        params.push(status);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const [countRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM permission_passes p
      JOIN permission_requests r ON p.request_id = r.request_id
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      ${whereSql}
    `, params);
    const total = countRows[0].total;

    // Items query with scan counts
    const [rows] = await db.query(`
      SELECT 
        p.pass_id,
        p.pass_reference,
        p.issued_at,
        p.valid_from,
        p.valid_until,
        p.status,
        p.revoked_at,
        p.revocation_reason,
        r.request_id,
        r.request_code,
        r.request_type,
        r.reason,
        r.overall_status,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.email AS student_email,
        s.registration_number,
        s.section,
        s.photo_url,
        d.name AS department_name,
        d.code AS department_code,
        rev.first_name AS revoker_name,
        (SELECT COUNT(*) FROM permission_pass_scans sc WHERE sc.pass_id = p.pass_id) AS scan_count,
        (SELECT MAX(scanned_at) FROM permission_pass_scans sc WHERE sc.pass_id = p.pass_id) AS last_scanned_at
      FROM permission_passes p
      JOIN permission_requests r ON p.request_id = r.request_id
      JOIN users u ON r.student_user_id = u.user_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN users rev ON p.revoked_by = rev.user_id
      ${whereSql}
      ORDER BY p.issued_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const today = new Date().toISOString().split('T')[0];
    const items = rows.map(item => {
      let dynamicStatus = item.status;
      if (item.status === 'ACTIVE' && item.valid_until) {
        const untilStr = new Date(item.valid_until).toISOString().split('T')[0];
        if (untilStr < today) dynamicStatus = 'EXPIRED';
      }
      return { ...item, status: dynamicStatus };
    });

    return {
      items,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Scan Analytics for Admin Dashboard
   */
  static async getScanAnalytics() {
    const [passStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_passes,
        SUM(CASE WHEN status = 'ACTIVE' AND valid_until >= CURDATE() THEN 1 ELSE 0 END) AS active_passes,
        SUM(CASE WHEN status = 'EXPIRED' OR (status = 'ACTIVE' AND valid_until < CURDATE()) THEN 1 ELSE 0 END) AS expired_passes,
        SUM(CASE WHEN status = 'REVOKED' THEN 1 ELSE 0 END) AS revoked_passes
      FROM permission_passes
    `);

    const [scanStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_scans,
        SUM(CASE WHEN verification_result = 'APPROVED AND VALID' THEN 1 ELSE 0 END) AS successful_scans,
        SUM(CASE WHEN verification_result IN ('REVOKED', 'EXPIRED', 'REJECTED', 'INVALID QR') THEN 1 ELSE 0 END) AS failed_scans
      FROM permission_pass_scans
    `);

    const [recentScans] = await db.query(`
      SELECT 
        s.scan_id,
        s.verification_result,
        s.scanned_at,
        s.ip_address,
        p.pass_reference,
        r.request_code,
        r.request_type,
        CONCAT(stu.first_name, ' ', stu.last_name) AS student_name,
        CONCAT(staff.first_name, ' ', staff.last_name) AS staff_name,
        staff.role AS staff_role
      FROM permission_pass_scans s
      JOIN permission_passes p ON s.pass_id = p.pass_id
      JOIN permission_requests r ON p.request_id = r.request_id
      JOIN users stu ON r.student_user_id = stu.user_id
      LEFT JOIN users staff ON s.scanned_by = staff.user_id
      ORDER BY s.scanned_at DESC
      LIMIT 10
    `);

    return {
      passes: passStats[0] || {},
      scans: scanStats[0] || {},
      recentScans
    };
  }

  /**
   * Retrieves scan logs for a specific pass
   */
  static async getPassScanHistory(passId) {
    const [rows] = await db.query(`
      SELECT 
        s.scan_id,
        s.verification_result,
        s.scanned_at,
        s.ip_address,
        s.notes,
        CONCAT(u.first_name, ' ', u.last_name) AS scanned_by_name,
        u.role AS scanned_by_role
      FROM permission_pass_scans s
      LEFT JOIN users u ON s.scanned_by = u.user_id
      WHERE s.pass_id = ?
      ORDER BY s.scanned_at DESC
    `, [passId]);

    return rows;
  }
}

module.exports = PassGeneratorService;
