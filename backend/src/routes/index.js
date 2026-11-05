const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const requestRoutes = require('./request.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
