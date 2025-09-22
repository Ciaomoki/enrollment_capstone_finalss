const e=require('express');
const { requireAuth,requireRole } = require('../middlewares/authMiddleware');
const r = e.Router();

r.use(requireAuth,requireRole('admin'));
r.get('/admin',(q,s)=>s.json({title:'Admin Dashboard'}));

module.exports=r;