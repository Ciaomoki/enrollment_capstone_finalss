const bcrypt=require('bcryptjs');
async function hashPassword(p){return bcrypt.hash(p,10);}
async function comparePassword(p,h){return bcrypt.compare(p,h);}

module.exports={hashPassword,comparePassword};