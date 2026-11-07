const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const requestRoutes = require('./request.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const officeRoutes = require('./office.routes');
const permissionPassRoutes = require('./permissionPass.routes');
const studentRoutes = require('./student.routes');

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/offices', officeRoutes);
router.use('/permission-passes', permissionPassRoutes);
router.use('/students', studentRoutes);

module.exports = router;
