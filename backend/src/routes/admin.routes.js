const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAIRoutingStats,
  listUsers,
  createUser,
  createStaffUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getDepartments,
  getWorkflows,
  getAssignments,
  assignMentor,
  assignMentorSection,
  getAuditLogs
} = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Stats accessible by HOD and Admin
router.get('/stats', verifyToken, requireRole('HOD', 'ADMIN'), getDashboardStats);
router.get('/ai-stats', verifyToken, requireRole('HOD', 'ADMIN', 'OFFICE_ADMIN'), getAIRoutingStats);

// Administrative operations
router.get('/users', verifyToken, requireRole('ADMIN'), listUsers);
router.post('/users', verifyToken, requireRole('ADMIN'), createUser);
router.post('/users/staff', verifyToken, requireRole('ADMIN'), createStaffUser);
router.put('/users/:id', verifyToken, requireRole('ADMIN'), updateUser);
router.patch('/users/:id/status', verifyToken, requireRole('ADMIN'), toggleUserStatus);
router.post('/users/:id/reset-password', verifyToken, requireRole('ADMIN'), resetUserPassword);

// Department, Section, and Mentor/Faculty Assignments
router.get('/departments', verifyToken, requireRole('ADMIN', 'HOD'), getDepartments);
router.get('/workflows', verifyToken, requireRole('ADMIN'), getWorkflows);
router.get('/assignments', verifyToken, requireRole('ADMIN', 'HOD'), getAssignments);
router.post('/mentor-assign', verifyToken, requireRole('ADMIN'), assignMentor);
router.post('/assignments/mentor-section', verifyToken, requireRole('ADMIN'), assignMentorSection);

// Audit Trail Logs
router.get('/audit-logs', verifyToken, requireRole('ADMIN'), getAuditLogs);

module.exports = router;
