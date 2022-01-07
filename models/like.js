const mongoose=require('mongoose');

const likeSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },

    //objectid for liked object
    likeable:{
        type:mongoose.Schema.ObjectId,
        require:true,
        refPath:'onModel'
    },
    //this is for dynamic reference
    onModel:{
        type:String,
        required:true,
        enum:['post','comment']
    }

},{
    timestamps:true
});

const Like=mongoose.model('like',likeSchema);
module.exports=Like;