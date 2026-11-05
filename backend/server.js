const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/error.middleware');
const { initReminderCron } = require('./src/services/reminderCron.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded supporting documents and generated PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), message: 'Department Workflow API is operational' });
});

// API Routes
app.use('/api', routes);

// Central Error Handler
app.use(errorHandler);

// Initialize automated background cron jobs for pending reminders
initReminderCron();

// Start Server & verify DB connection
app.listen(PORT, async () => {
  console.log(`[Server] Workflow Automation Agent running on port ${PORT}`);
  try {
    const connection = await db.getConnection();
    console.log('[Database] MySQL connection established successfully.');
    connection.release();
  } catch (err) {
    console.error('[Database] MySQL connection error:', err.message);
  }
});
