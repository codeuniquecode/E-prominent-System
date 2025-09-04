const mongoose = require('mongoose');
const url = process.env.mongodburl;
mongoose.connect(url).then(()=>{
    console.log('database connected');
}).catch((e)=>{
    console.log('error in connecting DB'+e);
});