const jwt = require('jsonwebtoken');
function requireAuth(req,res,next){
  try{
    const h=req.headers.authorization||''; const t=h.startsWith('Bearer ')?h.slice(7):null;
    if(!t) return res.status(401).json({error:'Missing token'});
    const p=jwt.verify(t, process.env.JWT_SECRET || 'devsecret');
    req.user = p; // {sub, role}
    next();
  }catch(e){ return res.status(401).json({error:'Invalid or expired token'}); }
}
function requireRole(...roles){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({error:'Unauthenticated'});
    if(!roles.includes(req.user.role)) return res.status(403).json({error:'Forbidden'});
    next();
  };
}
module.exports = { requireAuth, requireRole };
