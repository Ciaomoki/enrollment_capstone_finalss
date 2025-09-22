const { pool } = require('../config/connectiondb');

async function create({ employee_id, name, email, department, password_hash }){
  await pool.execute(
    'INSERT INTO evaluator (employee_id, name, email, department, password) VALUES (?,?,?,?,?)',
    [employee_id, name, email, department, password_hash]
  );
}
async function findById(employee_id){
  const [r] = await pool.execute('SELECT * FROM evaluator WHERE employee_id = ?', [employee_id]);
  return r[0] || null;
}
async function findByEmail(email){
  const [r] = await pool.execute('SELECT * FROM evaluator WHERE email = ?', [email]);
  return r[0] || null;
}

async function updatePassword(employee_id, password_hash){
  await pool.execute('UPDATE evaluator SET password=? WHERE employee_id=?',[password_hash, employee_id]);
}

module.exports = {  create, findById, findByEmail , updatePassword };
