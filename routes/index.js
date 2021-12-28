const express=require('express');
const router=express.Router();
const isAuth=require("../middleware/isAuth");

router.get('/',(req,res)=>{
    res.send("hello from routers");
})

router.use('/user',require('./user'));
router.get('/authentication',isAuth,function(req,res){res.status(200).json({success:true,msg:"authorized"})});

module.exports=router;