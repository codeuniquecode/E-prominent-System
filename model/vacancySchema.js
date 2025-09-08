const mongoose = require('mongoose');
const moment = require('moment');
const vacancySchema = mongoose.Schema({
    title:{
        require:true,
        type:String
    },
    description:{
        require:true,
        type:String
    },
    qualification:{
        require:true,
        type:String,
        enum:["SEE/SLC","+2","Bachelor","Masters"]
    },
    totalQuota:{
        require:true,
        type:Number
    },
    categoryQuota:{
        require:true,
        type:String,
        enum:["ALL","JanaJati","Female","Madeshi"]
    },
    deadline:{
        require:true,
        type:Date
    },
    postedAt:{
        require:true,
        type:String,
        default:moment(date).format('MMMM Do YYYY, h:mm:ss a')
    }
});

const vacancy = mongoose.model("Vacancy",vacancySchema);
module.exports = vacancy;