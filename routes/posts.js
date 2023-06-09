const express =require('express');
const router = express.Router();
const isAuth=require("../middleware/isAuth");
const Controller=require("../controllers/post");

router.post('/create',isAuth,Controller.create);
router.get('/allpost',isAuth,Controller.allpost);
router.get('/getpost/:id',isAuth,Controller.getpost);
router.put('/update/:id',isAuth,Controller.updatepost);
router.delete('/delete/:id',isAuth,Controller.delete);
router.get('/media/:filename',Controller.getmedia);

module.exports=router;