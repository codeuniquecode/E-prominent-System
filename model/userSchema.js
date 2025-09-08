const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        require:true,
        type:String
    },
    email:{
        require:true,
        unique:true,
        type:String
    },
    password:{
        require:true,
        type:String,
    },
    role:{
        required:true,
        type:String,
        default:'user'
    }
});

const user = mongoose.model("User",userSchema);
module.exports = user;