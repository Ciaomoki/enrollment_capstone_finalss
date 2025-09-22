const express = require('express');
const { requireAuth } = require('../middlewares/authMiddleware');
const c = require('../controllers/authController');
const v = require('../middlewares/validatorMiddleware');
const r = express.Router();

// Registration (student/evaluator only)
r.post('/student/register', v.studentRegister, c.registerStudent);
r.post('/evaluator/register', v.evaluatorRegister, c.registerEvaluator);

// Login per role using IDs
r.post('/login/student', v.studentLogin, c.loginStudent);
r.post('/login/evaluator', v.evaluatorLogin, c.loginEvaluator);
r.post('/login/admin', v.adminLogin, c.loginAdmin);

// Me
r.get('/me', requireAuth, c.me);

module.exports = r;
