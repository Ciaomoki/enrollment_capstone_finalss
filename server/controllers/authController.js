const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');
const Students = require('../models/studentModel');
const Evaluators = require('../models/evaluatorModel');
const Admins = require('../models/adminModel');

const EXP = process.env.JWT_EXPIRES_IN || '1d';
const sign = (sub, role) => jwt.sign({ sub, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: EXP });

// Student register
async function registerStudent(req,res,next){
  try{
    const errors=validationResult(req); if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    const { student_id, full_name, email, course, password } = req.body;
    const exists = await Students.findById(student_id) || await Students.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Student ID or email already exists' });
    const password_hash = await hashPassword(password);
    await Students.create({ student_id, full_name, email, course, password_hash });
    res.status(201).json({ message: 'Student registered' });
  }catch(e){ next(e); }
}

// Evaluator register
async function registerEvaluator(req,res,next){
  try{
    const errors=validationResult(req); if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    const { employee_id, name, email, department, password } = req.body;
    const exists = await Evaluators.findById(employee_id) || await Evaluators.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'Employee ID or email already exists' });
    const password_hash = await hashPassword(password);
    await Evaluators.create({ employee_id, name, email, department, password_hash });
    res.status(201).json({ message: 'Evaluator registered' });
  }catch(e){ next(e); }
}

// Student login by ID
async function loginStudent(req,res,next){
  try{
    const { student_id, password } = req.body;
    const u = await Students.findById(student_id);
    if(!u) return res.status(401).json({ error: 'Invalid credentials' });
    
const ok = await comparePassword(password, u.password);
if(!ok){
  // plaintext-compat fallback with automatic upgrade
  if (password === String(u.password)) {
    const password_hash = await hashPassword(password);
    try { await Students.updatePassword(u.student_id, password_hash); } catch(e){ /* ignore */ }
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
    const token = sign(String(u.student_id), 'student');
    res.json({ message: 'Logged in', token, user: { id: u.student_id, name: u.full_name, email: u.email, role: 'student' } });
  }catch(e){ next(e); }
}

// Evaluator login by ID
async function loginEvaluator(req,res,next){
  try{
    const { employee_id, password } = req.body;
    const u = await Evaluators.findById(employee_id);
    if(!u) return res.status(401).json({ error: 'Invalid credentials' });
    
const ok = await comparePassword(password, u.password);
if(!ok){
  // plaintext-compat fallback with automatic upgrade
  if (password === String(u.password)) {
    const password_hash = await hashPassword(password);
    try { await Evaluators.updatePassword(u.employee_id, password_hash); } catch(e){ /* ignore */ }
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
    const token = sign(String(u.employee_id), 'evaluator');
    res.json({ message: 'Logged in', token, user: { id: u.employee_id, name: u.name, email: u.email, role: 'evaluator' } });
  }catch(e){ next(e); }
}

// Admin login by ID (no public admin registration)
async function loginAdmin(req,res,next){
  try{
    const { admin_id, password } = req.body;
    const u = await Admins.findById(admin_id);
    if(!u) return res.status(401).json({ error: 'Invalid credentials' });
    
const ok = await comparePassword(password, u.password);
if(!ok){
  // plaintext-compat fallback with automatic upgrade
  if (password === String(u.password)) {
    const password_hash = await hashPassword(password);
    try { await Admins.updatePassword(u.admin_id, password_hash); } catch(e){ /* ignore */ }
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
    const token = sign(String(u.admin_id), 'admin');
    res.json({ message: 'Logged in', token, user: { id: u.admin_id, name: u.name, email: u.email, role: 'admin' } });
  }catch(e){ next(e); }
}

// Me (fetch by role)
const { pool } = require('../config/connectiondb');
async function me(req,res,next){
  try{
    const role = req.user.role;
    const id = req.user.sub;
    let row=null;
    if(role==='student'){
      const [r] = await pool.execute('SELECT student_id AS id, full_name AS name, email, "student" AS role FROM student WHERE student_id=?',[id]);
      row = r[0];
    } else if(role==='evaluator'){
      const [r] = await pool.execute('SELECT employee_id AS id, name, email, "evaluator" AS role FROM evaluator WHERE employee_id=?',[id]);
      row = r[0];
    } else if(role==='admin'){
      const [r] = await pool.execute('SELECT admin_id AS id, name, email, "admin" AS role FROM admin WHERE admin_id=?',[id]);
      row = r[0];
    }
    if(!row) return res.status(404).json({ error: 'User not found' });
    res.json({ user: row });
  }catch(e){ next(e); }
}

module.exports = {
  registerStudent, registerEvaluator,
  loginStudent, loginEvaluator, loginAdmin,
  me
};
