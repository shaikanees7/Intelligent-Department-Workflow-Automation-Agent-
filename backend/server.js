const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./database/db');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/error.middleware');
const { initReminderCron } = require('./src/services/reminderCron.service');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads and temp directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// CORS & Body Parsing Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded supporting documents and generated PDFs
app.use('/uploads', express.static(uploadsDir));
app.use('/temp', express.static(tempDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Intelligent Department Workflow Automation API is operational'
  });
});

// API Routes
app.use('/api', routes);

// Central Error Handler
app.use(errorHandler);

// Serve frontend React production build if available
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/temp')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Initialize automated background cron jobs for pending reminders
try {
  initReminderCron();
} catch (cronErr) {
  console.warn('[Cron] Notice:', cronErr.message);
}

// Start Server & verify DB connection
const server = app.listen(PORT, async () => {
  console.log(`[Server] Workflow Automation Agent running on port ${PORT}`);
  try {
    const connection = await db.getConnection();
    console.log('[Database] MySQL connection established successfully.');
    connection.release();
  } catch (err) {
    console.error('[Database] MySQL connection error:', err.message);
  }
});

module.exports = { app, server };
