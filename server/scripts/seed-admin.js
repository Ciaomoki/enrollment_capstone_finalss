require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/connectiondb');

(async () => {
  try {
    const id = parseInt(process.env.SEED_ADMIN_ID || '1', 10);
    const name = process.env.SEED_ADMIN_NAME || 'System Admin';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const pass = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

    const [existing] = await pool.execute('SELECT admin_id FROM admin WHERE admin_id = ? OR email = ?', [id, email]);
    if (existing.length) { console.log('Admin already exists'); process.exit(0); }

    const hash = await bcrypt.hash(pass, 10);
    await pool.execute('INSERT INTO admin (admin_id, name, email, password) VALUES (?,?,?,?)', [id, name, email, hash]);
    console.log('Seeded admin:', email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
