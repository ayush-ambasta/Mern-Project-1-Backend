const express =require('express');
const router = express.Router();
const isAuth=require("../middleware/isAuth");
const Controller=require("../controllers/like");

router.post('/toggle',isAuth,Controller.toggleLike);

module.exports=router;
