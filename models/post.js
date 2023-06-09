const mongoose=require('mongoose');
const multer=require('multer');
const {GridFsStorage}=require('multer-gridfs-storage');

// const path=require('path');
// const POST_PATH=path.join('/uploads/users/posts');

const postSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    //include the array of id of all comments in this post
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'comment'
    }],
    file:{
        type:String
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'like'
        }
    ]
},{
    timestamps:true
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null,path.join(__dirname,'..',POST_PATH));
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb (null, file.fieldname + '-' + uniqueSuffix+path.extname(file.originalname));
//     }
// });

const storage=new GridFsStorage({
    url:process.env.MONGOURI,
    options:{useNewUrlParser:true,useUnifiedTopology:true},
    file:(req,file)=>{
        return{
            bucketName:"postmedia",
            filename:`${Date.now()}-post-${file.originalname}`
        }
    }
});

postSchema.statics.uploadedPost = multer({storage:  storage}).single('Postfile');
postSchema.statics.postfile = POST_PATH;

const Post=mongoose.model('post',postSchema);
module.exports=Post;