const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  listUsers,
  createUser,
  updateUser,
  getDepartments,
  getWorkflows,
  assignMentor
} = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Stats accessible by HOD and Admin
router.get('/stats', verifyToken, requireRole('HOD', 'ADMIN'), getDashboardStats);

// Administrative operations
router.get('/users', verifyToken, requireRole('ADMIN'), listUsers);
router.post('/users', verifyToken, requireRole('ADMIN'), createUser);
router.put('/users/:id', verifyToken, requireRole('ADMIN'), updateUser);
router.get('/departments', verifyToken, requireRole('ADMIN', 'HOD'), getDepartments);
router.get('/workflows', verifyToken, requireRole('ADMIN'), getWorkflows);
router.post('/mentor-assign', verifyToken, requireRole('ADMIN'), assignMentor);

module.exports = router;
