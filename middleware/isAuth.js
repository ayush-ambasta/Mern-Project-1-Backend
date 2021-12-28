const jwt = require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET;

module.exports=async(req,res,next)=>{

    try{
        const token=req.header('auth-token');
        if(!token){
            res.status(401).send({error:"not authorized"});
        }
        const data=jwt.verify(token, JWT_SECRET);
        req.user=data.user.id;
        next();
    }catch(error){
        console.log(error);
        return res.status(401).send({error:"not authorized"});
    }
}