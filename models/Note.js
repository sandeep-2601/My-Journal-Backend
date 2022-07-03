const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required: true
    },
    tag : {
        type : String,
        default : general 
    },
    date : {
        type: Date,
        default: Date.now,
        unique: true
    }
});

module.exports = mongoose.model('Note',noteSchema);