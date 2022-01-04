require('dotenv').config();
const cors=require('cors');

const connectTOMongo=require('./db');
const express=require('express');

connectTOMongo();

const app=express();
const port=5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use('/uploads',express.static(__dirname+'/uploads'));
app.use('/',require('./routes'));


app.listen(port,()=>{
    console.log(`app is listening at port ${port}`);
})

