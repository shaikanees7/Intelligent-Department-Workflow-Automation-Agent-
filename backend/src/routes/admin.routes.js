const express = require('express');
const router = express.Router();
const { getDashboardStats, listUsers } = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/stats', verifyToken, requireRole('HOD', 'ADMIN'), getDashboardStats);
router.get('/users', verifyToken, requireRole('ADMIN'), listUsers);

module.exports = router;
