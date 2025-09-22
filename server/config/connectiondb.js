const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: test the connection once at startup
async function initDB() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL connected');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
}

/** Generic query helper (returns rows) */
function query(sql, params = []) {
  return pool.execute(sql, params).then(([rows]) => rows);
}

/** Backward-compatible with your name */
const zeroParamPromise = (sql) => query(sql);

module.exports = { pool, query, zeroParamPromise, initDB };