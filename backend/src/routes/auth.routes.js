const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
