const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
// const fs=require('fs');
const mongoose=require('mongoose');
// const path=require('path');
const {validateNewUser}=require("../middleware/validation");
const User=require('../models/user');
const JWT_SECRET=process.env.JWT_SECRET;

module.exports.signup=async (req,res)=>{

    try{
        let success=false;
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;

        const validation=validateNewUser(req);
        if(validation.error){
             return res.status(400).send({success,msg:validation.error.details[0].message});
        }
        
        const salt=await bcrypt.genSalt(10);
        const secpassword=await bcrypt.hash(password,salt);

        const user=await User.findOne({email:email});
        if(user){
            res.status(403).json({success,msg:"User already exists"});
        }else{
            const newuser=await User.create({name:name,email:email,password:secpassword});
            const data={
                user:{
                    id:newuser.id
                }
            }
            const token=jwt.sign(data,JWT_SECRET);
            success=true;
            res.status(200).json({success,msg:"User registered successfully",token});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,msg:"Internal server error"});
    }
    
}

module.exports.login=async (req,res)=>{
    try{
        let success=false;
        const email=req.body.email;
        const password=req.body.password;

        const user=await User.findOne({email:email});
        if(user){
            const isEqual = await bcrypt.compare(password, user.password)
            if(!isEqual){
                res.status(401).json({success,msg:"Invalid Credentials"});
            }else{
                const data={
                    user:{
                        id:user.id
                    }
                }
                const token=jwt.sign(data,JWT_SECRET);
                success=true;
                res.status(200).json({success,msg:"Logged in successfully",token});
            }
        }else{
                res.status(401).json({success,msg:"Invalid Credentials"});
        }

    }catch(error){
        console.log(error);
        res.status(500).json({success:false,msg:"Internal server error"});
    }
}

module.exports.update=async (req,res)=>{
    if(req.user==req.params.id){
        try {
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req, res, async(err)=>{
                if (err) {return res.status(500).json({"msg":"Image only"})}
                if(req.body.name){
                 user.name = req.body.name;
                }
                if (req.file){
                    if (user.avatar){
                        //first delete
                        const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
                            bucketName:'avatar'
                        });
                        let filename=user.avatar;
                        let deletefile= await bucket.find({filename}).toArray();
                        if(deletefile){
                            bucket.delete(deletefile[0]._id);
                        }
                        user.avatar=req.file.filename;
                    }
                    user.avatar =req.file.filename;
                }
                user.save();
                res.status(200).json({success:true,msg:"Updated Successfully"});
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({msg:error});
        }
    }else{
        return res.status(401).send('Unauthorized');
    }

}

module.exports.deleteAvatar=async (req,res)=>{
    if(req.user==req.params.id){
        try{
            let user = await User.findById(req.params.id);
            if (user.avatar){
                const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
                    bucketName:'avatar'
                });
                let filename=user.avatar;
                let deletefile= await bucket.find({filename}).toArray();
                if(deletefile){
                    bucket.delete(deletefile[0]._id);
                }
                user.avatar="";
                user.save();
                res.status(200).json({success:true,msg:"Deleted Successfully"});
            }else{
                res.status(404).json({success:false,msg:"No Avatar found"})
            }
        }catch(error){
            console.log(error);
            res.status(500).json({msg:"Internal server error"});
        }
    }else{
        return res.status(401).send('Unauthorized');
    }
}

module.exports.search=async (req,res)=>{
    try{
        let name=req.body.name;
        let username;
        if(name){
            username=await User.find({"name":new RegExp(name,'i')},{name:1}).sort();
            res.status(200).json({success:true,username});
        }if(!username){
            res.status(404).json({success:false,username:[]});
        }

    }catch(error){
        console.log(error);
        res.status(500).json({success:false,msg:"Internal server error"});
    }
}

module.exports.profile=async (req,res)=>{
    try{
        let profileId=req.params.id || req.user;
        const profile=await User.find({"_id":profileId},{name:1,avatar:1});
        res.status(200).json({success:true,profile});
    }catch(error){
        console.log(error);
        res.status(500).json({success:false,msg:"Internal server error"})
    }
}

module.exports.getmedia=async(req,res)=>{
    try{
        const bucket=new mongoose.mongo.GridFSBucket(mongoose.connection.db,{
            bucketName:'avatar'
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