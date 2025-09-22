const { body } = require('express-validator');

module.exports.studentRegister = [
  body('student_id').isInt().toInt(),
  body('full_name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('course').trim().notEmpty(),
  body('password').isLength({ min: 6 })
];

module.exports.evaluatorRegister = [
  body('employee_id').isInt().toInt(),
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('department').trim().notEmpty(),
  body('password').isLength({ min: 6 })
];

module.exports.studentLogin = [
  body('student_id').isInt().toInt(),
  body('password').notEmpty()
];

module.exports.evaluatorLogin = [
  body('employee_id').isInt().toInt(),
  body('password').notEmpty()
];

module.exports.adminLogin = [
  body('admin_id').isInt().toInt(),
  body('password').notEmpty()
];
