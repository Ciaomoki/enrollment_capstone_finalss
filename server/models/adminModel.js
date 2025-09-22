const { pool } = require('../config/connectiondb');
async function findById(admin_id){
  const [r] = await pool.execute('SELECT * FROM admin WHERE admin_id = ?', [admin_id]);
  return r[0] || null;
}
async function findByEmail(email){
  const [r] = await pool.execute('SELECT * FROM admin WHERE email = ?', [email]);
  return r[0] || null;
}
async function create({ admin_id, name, email, password_hash }){
  await pool.execute('INSERT INTO admin (admin_id, name, email, password) VALUES (?,?,?,?)',
    [admin_id, name, email, password_hash]);
}

async function updatePassword(admin_id, password_hash){
  await pool.execute('UPDATE admin SET password=? WHERE admin_id=?',[password_hash, admin_id]);
}

module.exports = {  findById, findByEmail, create , updatePassword };
