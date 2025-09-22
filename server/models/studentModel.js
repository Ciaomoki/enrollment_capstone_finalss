const { pool } = require('../config/connectiondb');

async function create({ student_id, full_name, email, course, password_hash }){
  await pool.execute(
    'INSERT INTO student (student_id, full_name, email, course, password) VALUES (?,?,?,?,?)',
    [student_id, full_name, email, course, password_hash]
  );
}
async function findById(student_id){
  const [r] = await pool.execute('SELECT * FROM student WHERE student_id = ?', [student_id]);
  return r[0] || null;
}
async function findByEmail(email){
  const [r] = await pool.execute('SELECT * FROM student WHERE email = ?', [email]);
  return r[0] || null;
}

async function updatePassword(student_id, password_hash){
  await pool.execute('UPDATE student SET password=? WHERE student_id=?',[password_hash, student_id]);
}

module.exports = {  create, findById, findByEmail , updatePassword };

