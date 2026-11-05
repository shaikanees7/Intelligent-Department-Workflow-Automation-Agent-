const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');
const { submitRequest, getMyRequests, getRequestTracking, reviewAction } = require('../controllers/request.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validateRequestSubmission } = require('../middleware/validator.middleware');

router.post('/', verifyToken, requireRole('STUDENT'), upload.single('supporting_document'), validateRequestSubmission, submitRequest);
router.get('/my', verifyToken, requireRole('STUDENT'), getMyRequests);
router.get('/:id/track', verifyToken, getRequestTracking);
router.post('/:id/action', verifyToken, requireRole('MENTOR', 'FACULTY', 'HOD', 'ADMIN'), reviewAction);

module.exports = router;
