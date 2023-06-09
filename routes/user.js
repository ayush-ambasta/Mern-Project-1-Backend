const express =require('express');
const router = express.Router();
const isAuth=require("../middleware/isAuth");
const Controller=require("../controllers/user");

router.post('/signup',Controller.signup);
router.post('/login',Controller.login);
router.put('/update/:id',isAuth,Controller.update);
router.post('/search',isAuth,Controller.search);
router.delete('/deleteAvatar/:id',isAuth,Controller.deleteAvatar);
router.get('/profile',isAuth,Controller.profile);
router.get('/profile/:id',isAuth,Controller.profile);
router.get('/media/:filename',Controller.getmedia);
module.exports = router;