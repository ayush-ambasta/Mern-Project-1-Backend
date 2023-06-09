const mongoose = require('mongoose');
const multer=require('multer');
const {GridFsStorage}=require('multer-gridfs-storage');
// const path=require('path');
// const AVATAR_PATH=path.join('/uploads/users/avatars');


const userSchema= new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true,
    },
    name:{
        type: String,
        required: true,
    },
    avatar:{
        type:String
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

userSchema.virtual('posts',{
    ref:'post',
    localField:'_id',
    foreignField:'user'
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null,path.join(__dirname,'..',AVATAR_PATH));
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb (null, file.fieldname + '-' + uniqueSuffix);
//     }
// });

const storage=new GridFsStorage({
    url:process.env.MONGOURI,
    options:{useNewUrlParser:true,useUnifiedTopology:true},
    file:(req,file)=>{
        return{
            bucketName:"avatar",
            filename:`${Date.now()}-avatar-${file.originalname}`
        }
    }
});

userSchema.statics.uploadedAvatar = multer({storage:  storage,fileFilter:function(req,file,cb){checkType(file,cb)}}).single('avatar');
function checkType(file,cb){
    if(file.mimetype=="image/png" || file.mimetype=="image/jpg" || file.mimetype=="image/jpeg"){
        cb(null,true);
    }else{
        cb(null,false);
        return cb(new Error('Only .png, .jpg, or .jpeg allowed!'));
    }
}
userSchema.statics.avatarPath = AVATAR_PATH;


const User=mongoose.model('user',userSchema);
module.exports=User;