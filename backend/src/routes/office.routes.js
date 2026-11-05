const express = require('express');
const router = express.Router();
const {
  listOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  getOfficeApplications,
  officeAction,
  getOfficeStats
} = require('../controllers/office.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public/Authenticated office listing
router.get('/', verifyToken, listOffices);
router.get('/:id', verifyToken, getOfficeById);
router.get('/:id/stats', verifyToken, getOfficeStats);

// Office applications queue
router.get('/:id/applications', verifyToken, requireRole('OFFICE_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), getOfficeApplications);
router.post('/:id/action', verifyToken, requireRole('OFFICE_ADMIN', 'ADMIN', 'HOD'), officeAction);

// Admin office management
router.post('/', verifyToken, requireRole('ADMIN'), createOffice);
router.put('/:id', verifyToken, requireRole('ADMIN'), updateOffice);

module.exports = router;
