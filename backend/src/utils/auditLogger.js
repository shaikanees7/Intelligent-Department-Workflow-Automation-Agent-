/**
 * Centralized Audit Logging Utility
 * Records all critical administrative, authentication, and workflow events
 */

const db = require('../../database/db');

async function logAudit({ userId = null, action, entityType, entityId = null, details = null, ipAddress = null }) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        action,
        entityType,
        entityId ? String(entityId) : null,
        typeof details === 'object' ? JSON.stringify(details) : (details || null),
        ipAddress || null
      ]
    );
  } catch (err) {
    console.warn('[AuditLogger] Warning: Could not record audit log:', err.message);
  }
}

module.exports = { logAudit };
