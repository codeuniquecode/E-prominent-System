const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the admin who posted it
        required: true
    }
}, { timestamps: true });

const Vacancy = mongoose.model('Vacancy', vacancySchema);
module.exports = Vacancy;