const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');
const { getStudentPhoto, updateStudentPhoto } = require('../controllers/student.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/profile/photo', verifyToken, requireRole('STUDENT'), getStudentPhoto);
router.post('/profile/photo', verifyToken, requireRole('STUDENT'), upload.single('photo'), updateStudentPhoto);

module.exports = router;
