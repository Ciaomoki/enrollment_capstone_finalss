const e=require('express');
const { requireAuth,requireRole }=require('../middlewares/authMiddleware');
const r = e.Router();r.use(requireAuth,requireRole('student','admin'));

r.get('/student',(q,s)=>s.json({title:'Student Dashboard'}));

module.exports = r;