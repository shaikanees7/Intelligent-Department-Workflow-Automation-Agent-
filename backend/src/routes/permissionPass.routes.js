const express = require('express');
const router = express.Router();
const {
  getMyPermissions,
  getPassDetails,
  verifyPass,
  listAdminPasses,
  revokePass,
  getScanAnalytics,
  getPassScanHistory
} = require('../controllers/permissionPass.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Student endpoints
router.get('/my', verifyToken, requireRole('STUDENT'), getMyPermissions);
router.get('/details/:passReferenceOrId', verifyToken, getPassDetails);

// Verification endpoints (real-time scanner / mobile link)
router.post('/verify', verifyPass);
router.get('/verify', verifyPass);
router.get('/verify/:ref', verifyPass);

// Admin Pass Management endpoints
router.get('/admin/list', verifyToken, requireRole('ADMIN'), listAdminPasses);
router.post('/admin/:passId/revoke', verifyToken, requireRole('ADMIN'), revokePass);
router.get('/admin/analytics', verifyToken, requireRole('ADMIN'), getScanAnalytics);
router.get('/admin/:passId/history', verifyToken, requireRole('ADMIN'), getPassScanHistory);

module.exports = router;
