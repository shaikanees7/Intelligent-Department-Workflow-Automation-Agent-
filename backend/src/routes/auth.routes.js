const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config');
const {
  login,
  register,
  changePassword,
  forgotPassword,
  getProfile,
  logout
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', upload.single('photo'), register);
router.post('/logout', logout);
router.get('/profile', verifyToken, getProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;
