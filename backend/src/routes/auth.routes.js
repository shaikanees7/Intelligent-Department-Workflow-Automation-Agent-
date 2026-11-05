const express = require('express');
const router = express.Router();
const { login, register, getProfile, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
