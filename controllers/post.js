const Post=require('../models/post');
const Comment=require('../models/comment');
const mongoose=require('mongoose');
const Like=require('../models/like');
const User=require('../models/user');
// const fs=require('fs');
// const path=require('path');

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
                populate:[{
                    path:'user',
                    select:'name'
                    },
                    {
                    path: 'likes'
                    }
                ]
            }
        )
        .populate('likes')
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
                populate:[
                    {
                    path:'comments',
                    populate:[
                        {
                        path:'user',
                        select:'name'
                        },
                        {
                        path: 'likes'
                        }
                    ]
                },
                {
                    path:'likes'
                }
                ],
                options:{sort:{'createdAt':-1}}
            }
        )
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
                Post.uploadedPost(req,res,async (err)=>{
                    if(err){return res.status(500).json({Success:false,"msg":"Error From Multer"})}
                    
                    let file;
                    let content;
                    if(req.body.content && req.file){
                        file=req.file.filename;
                        content=req.body.content;
                        post.content=content;
                        if(post.file){
                            const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
                                bucketName:'postmedia'
                            });
                            let filename=post.file;
                            let deletefile= await bucket.find({filename}).toArray();
                            if(deletefile){
                                bucket.delete(deletefile[0]._id);
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
            await Like.deleteMany({likeable: post, onModel: 'post'});
            await Like.deleteMany({_id: {$in: post.comments.likes}});
            if(post.file){
                const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
                    bucketName:'postmedia'
                });
                let filename=post.file;
                let deletefile= await bucket.find({filename}).toArray();
                if(deletefile){
                    bucket.delete(deletefile[0]._id);
                }
            }
            await post.remove();
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

module.exports.getmedia=async(req,res)=>{
    try{
        const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
            bucketName:'postmedia'
        });
        let downloadStream=bucket.openDownloadStreamByName(req.params.filename);
        downloadStream.on("data",function(data){
            return res.status(200).write(data);
        });
        downloadStream.on("error",function(err){
            return res.status(404).send({msg:"cannot"});
        })
        downloadStream.on("end",()=>{
            return res.end();
        })
    }catch(error){
        console.log(error)
        res.status(500).json({msg:"something went wrong"});
    }
}