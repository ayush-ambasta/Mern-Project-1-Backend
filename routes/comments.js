const express =require('express');
const router = express.Router();
const isAuth=require("../middleware/isAuth");
const Controller=require("../controllers/comment");

router.post('/create',isAuth,Controller.create);
router.put('/update/:id',isAuth,Controller.update);
router.delete('/delete/:id',isAuth,Controller.delete);


module.exports=router;