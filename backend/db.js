const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Resolve password from Docker Secret file if provided, otherwise fallback to DB_PASSWORD env
let dbPassword = process.env.DB_PASSWORD || 'postgres';
if (process.env.DB_PASSWORD_FILE && fs.existsSync(process.env.DB_PASSWORD_FILE)) {
  try {
    dbPassword = fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim();
    console.log('🔒 Database password loaded successfully from Docker Secret file.');
  } catch (err) {
    console.error('⚠️ Could not read Docker Secret password file:', err.message);
  }
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: dbPassword,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});

// Auto-create table with retry logic on startup
async function initDatabase(retries = 10, delayMs = 2000) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS login_records (
      id SERIAL PRIMARY KEY,
      email_or_username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(50)
    );
  `;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(createTableQuery);
      console.log('✅ PostgreSQL: "login_records" table is ready.');
      return;
    } catch (err) {
      console.log(`⏳ PostgreSQL connection attempt ${attempt}/${retries} waiting for DB: ${err.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.error('❌ PostgreSQL connection error after retries:', err.message);
      }
    }
  }
}

module.exports = {
  pool,
  initDatabase,
};
