const mongoose = require('mongoose');
const moment = require('moment');
const applicationSchema = mongoose.Schema({
    
});

const application = mongoose.model("Application",applicationSchema);
module.exports = application;