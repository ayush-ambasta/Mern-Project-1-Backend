const Post=require('../models/post');
const Comment=require('../models/comment');
const User=require('../models/user');
const fs=require('fs');
const path=require('path');

module.exports.create=async (req,res)=>{
    try{
        Post.uploadedPost(req,res,function(err){
            if(err){return res.status(500).json({Success:false,"msg":"Error From Multer"})}
            
            let file;
            let content;
            if(req.body.content && req.file){
                file=Post.postfile + '/' + req.file.filename;
                content=req.body.content;
                Post.create({content:content,user:req.user,file:file});
                return res.status(200).json({success:true,msg:'Post created'});
            }else{
                content=req.body.content;
                Post.create({user:req.user,content:content});
                return res.status(200).json({success:true,msg:'Post created'});
            }
            
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Internal Server Error'});
    }
}

module.exports.allpost=async (req,res)=>{
    try{
        const post=await Post.find({},{content:1,file:1,comments:1})
        .populate('user','name')
        .populate(
            {
                path:'comments',
                populate:{
                    path:'user',
                    select:'name'
                }
            }
        )
        .sort('-createdAt');
        return res.status(200).json({success:true,post});

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Internal Server Error'});
    }
}

module.exports.getpost=async (req,res)=>{
    try{
        const post=await User.findById(req.params.id,{posts:1})
        .populate(
            {
                path:'posts',
                populate:{
                    path:'comments',
                    populate:{
                        path:'user',
                        select:'name'
                    }
                },
                options:{sort:{'createdAt':-1}}
            }
        );
        return res.status(200).json({success:true,post});

    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:'Internal Server Error'});
    }
}

module.exports.updatepost=async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(post){
            if(req.user==post.user){
                Post.uploadedPost(req,res,function(err){
                    if(err){return res.status(500).json({Success:false,"msg":"Error From Multer"})}
                    
                    let file;
                    let content;
                    if(req.body.content && req.file){
                        file=Post.postfile + '/' + req.file.filename;
                        content=req.body.content;
                        post.content=content;
                        if(post.file){
                            if(fs.existsSync(path.join(__dirname,'..',post.file))){
                                fs.unlinkSync(path.join(__dirname,'..',post.file));
                            }
                        }
                        post.file=file;
                        post.user=req.user;
                        post.save();
                        return res.status(200).json({success:true,msg:'Post Updated'});
                    }else{
                        content=req.body.content;
                        post.content=content;
                        post.user=req.user;
                        post.save();
                        return res.status(200).json({success:true,msg:'Post Updated'});
                    }
                    
                })
            }else{
                return res.status(401).json({success:false,msg:'Not authorized'});
            }
        } 
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,msg:"Internal Server Error"});
    }
}

module.exports.delete=async (req,res)=>{
    try{
        let post=await Post.findById(req.params.id);
        if(req.user==post.user){
            if(post.file){
                if(fs.existsSync(path.join(__dirname,'..',post.file))){
                    fs.unlinkSync(path.join(__dirname,'..',post.file));
                }
            }
            post.remove();
            await Comment.deleteMany({post:req.params.id});
            return res.status(200).json({success:true,msg:'deleted Successfully'});
        }else{
            return res.status(401).json({success:false,msg:'Not authorized'});
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({success:false,msg:"Internal Server Error"});
    }
}