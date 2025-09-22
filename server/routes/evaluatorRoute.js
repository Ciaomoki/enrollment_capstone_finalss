const e=require('express');
const { requireAuth,requireRole }=require('../middlewares/authMiddleware');
const r = e.Router();r.use(requireAuth, requireRole('evaluator','admin'));

r.get('/evaluator',(q,s)=>s.json({title:'Evaluator Dashboard'}));

module.exports = r;