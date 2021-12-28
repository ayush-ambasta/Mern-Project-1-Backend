const mongoose=require('mongoose');

const mongoURI=process.env.MONGOURI;

const connectTOMongo=async()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("connected to mongodb");
    })
}
module.exports=connectTOMongo;