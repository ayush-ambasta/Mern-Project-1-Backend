const Like=require('../models/like');
const Comment =require('../models/comment');
const Post=require('../models/post');

module.exports.toggleLike=async(req,res)=>{
    try{
        let likeable;
        let deleted =false;

        if(req.query.type=='post'){
            likeable=await Post.findById(req.query.id).populate('likes');
        }else{
            likeable=await Comment.findById(req.query.id).populate('likes');
        }
        //check like exists or not
        let existsLike=await Like.findOne({
            likeable:req.query.id,
            onModel:req.query.type,
            user:req.user
        });
        if(existsLike){
            likeable.likes.pull(existsLike._id);
            likeable.save();
            existsLike.remove();
            deleted=true;
        }else{
            let newLike=await Like.create({
                likeable:req.query.id,
                onModel:req.query.type,
                user:req.user
            });
            likeable.likes.push(newLike._id);
            likeable.save();
        }
        return res.status(200).json({success:true,deleted:deleted});
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Internal Server Error'})
;    }
}