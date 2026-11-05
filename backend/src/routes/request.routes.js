const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');
const {
  submitRequest,
  getMyRequests,
  getPendingRequests,
  getRequestTracking,
  getAIRoutingDetails,
  submitClarification,
  manualRoute,
  reviewAction
} = require('../controllers/request.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateRequestSubmission } = require('../middleware/validator.middleware');

// Student submission & list
router.post('/', verifyToken, requireRole('STUDENT'), upload.any(), validateRequestSubmission, submitRequest);
router.get('/my', verifyToken, requireRole('STUDENT'), getMyRequests);

// Reviewer pending queue (Mentor, Faculty, HOD, Admin, Office Admin)
router.get('/pending', verifyToken, requireRole('MENTOR', 'FACULTY', 'HOD', 'ADMIN', 'OFFICE_ADMIN'), getPendingRequests);

// Tracking and review action
router.get('/:id/track', verifyToken, getRequestTracking);
router.post('/:id/action', verifyToken, requireRole('MENTOR', 'FACULTY', 'HOD', 'ADMIN', 'OFFICE_ADMIN'), reviewAction);

// AI Routing, Clarification & Manual Override Endpoints
router.get('/:id/ai-routing', verifyToken, getAIRoutingDetails);
router.post('/:id/clarify', verifyToken, requireRole('STUDENT'), submitClarification);
router.post('/:id/manual-route', verifyToken, requireRole('ADMIN', 'HOD', 'OFFICE_ADMIN'), manualRoute);

module.exports = router;
