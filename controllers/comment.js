const Comment =require('../models/comment');
const Post=require('../models/post');
const Like=require('../models/like');
module.exports.create=async(req,res)=>{
    try{
        let post=await Post.findById(req.body.post);
        if(post){
            let comment=await Comment.create({
                content: req.body.content,
                post:req.body.post,
                user: req.user
            });
            post.comments.push(comment);
            post.save();
            return res.status(200).json({success:true,msg:'Comment Created'});
        }else{
            return res.status(500).json({success:false,msg:'Something went wrong'});
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Internal Server Error'});
    }
}

module.exports.update=async (req,res)=>{
    try {
        const comment=await Comment.findById(req.params.id);
        if(comment){
            if(req.user==comment.user){
                comment.content=req.body.content;
                comment.save();
                return res.status(200).json({success:true,msg:"Updated Successfully"})
            }else{
                return res.status(401).json({success:false,msg:'Not authorized'});
            }
        } 
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,msg:"Internal Server Error"});
    }
}

module.exports.delete=async(req,res)=>{

    try{
        let comment=await Comment.findById(req.params.id);
        let post= await Post.findById(comment.post);
        if(comment.user == req.user || post.user==req.user){
            let postId=comment.post;
            await Like.deleteMany({likeable: comment._id, onModel: 'comment'});
            comment.remove();
            await Post.findByIdAndUpdate(postId,{$pull:{comments:req.params.id}});   
            return res.status(200).json({success:true,msg:"Comment deleted"});
        }else{
            return res.status(401).json({success:false,msg:'Not authorized'});
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:"Internal Server Error"});
    }
}