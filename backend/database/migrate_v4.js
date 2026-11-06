/**
 * Migration v4: QR-Based Digital Permission Passes & Verification Audit Scans
 */

const db = require('./db');
const crypto = require('crypto');
const QRCode = require('qrcode');

async function runMigration() {
  console.log('--- RUNNING MIGRATION V4: QR-BASED DIGITAL PERMISSION PASSES ---');
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Create permission_passes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permission_passes (
        pass_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL UNIQUE,
        pass_reference VARCHAR(50) UNIQUE NOT NULL,
        verification_token_hash VARCHAR(64) NOT NULL,
        qr_code_data LONGTEXT NULL,
        issued_at DATETIME NOT NULL,
        valid_from DATE NOT NULL,
        valid_until DATE NOT NULL,
        status ENUM('ACTIVE', 'EXPIRED', 'REVOKED') DEFAULT 'ACTIVE',
        revoked_at DATETIME NULL,
        revoked_by INT NULL,
        revocation_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE,
        FOREIGN KEY (revoked_by) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_pass_ref (pass_reference),
        INDEX idx_pass_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created permission_passes table');

    // 2. Create permission_pass_scans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permission_pass_scans (
        scan_id INT AUTO_INCREMENT PRIMARY KEY,
        pass_id INT NOT NULL,
        scanned_by INT NULL,
        verification_result VARCHAR(50) NOT NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50) NULL,
        notes TEXT NULL,
        FOREIGN KEY (pass_id) REFERENCES permission_passes(pass_id) ON DELETE CASCADE,
        FOREIGN KEY (scanned_by) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_scan_pass (pass_id),
        INDEX idx_scan_user (scanned_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created permission_pass_scans table');

    // 3. Backfill digital passes for any existing APPROVED permission requests
    const [approvedRequests] = await connection.query(`
      SELECT r.request_id, r.request_code, r.start_date, r.end_date, r.created_at
      FROM permission_requests r
      LEFT JOIN permission_passes p ON r.request_id = p.request_id
      WHERE r.overall_status = 'APPROVED' AND p.pass_id IS NULL
    `);

    console.log(`Found ${approvedRequests.length} approved requests needing digital passes.`);

    for (const req of approvedRequests) {
      const passRef = `PASS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-pass?ref=${passRef}&token=${rawToken}`;

      const qrCodeData = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#1e1b4b', // deep navy
          light: '#ffffff'
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const validUntilStr = new Date(req.end_date).toISOString().split('T')[0];
      const initialStatus = validUntilStr < today ? 'EXPIRED' : 'ACTIVE';

      await connection.query(`
        INSERT INTO permission_passes 
        (request_id, pass_reference, verification_token_hash, qr_code_data, issued_at, valid_from, valid_until, status)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
      `, [
        req.request_id,
        passRef,
        tokenHash,
        qrCodeData,
        new Date(req.start_date).toISOString().split('T')[0],
        validUntilStr,
        initialStatus
      ]);

      console.log(`   + Generated pass ${passRef} for Request #${req.request_id} (${req.request_code})`);
    }

    await connection.commit();
    console.log('🎉 MIGRATION V4 COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration v4 failed:', err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
