const express=require('express');
const router=express.Router();
const isAuth=require("../middleware/isAuth");

router.get('/',(req,res)=>{
    res.send("hello from routers");
})

router.use('/user',require('./user'));
router.use('/posts',require('./posts'));
router.use('/comments',require('./comments'));
router.use('/likes',require('./likes'));
// router.get('/authentication',isAuth,function(req,res){res.status(200).json({success:true,msg:"authorized"})});

module.exports=router;