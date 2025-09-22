require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/connectiondb');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'enrollment_db.sql'), 'utf-8');
    const parts = sql.split(/;\s*\n/).map(s=>s.trim()).filter(Boolean);
    for (const p of parts) {
      await pool.query(p);
    }
    console.log('Database initialized.');
    process.exit(0);
  } catch (e) {
    console.error('Init error:', e);
    process.exit(1);
  }
})();
