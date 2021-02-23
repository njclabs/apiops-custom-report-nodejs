const mongoose = require('mongoose')

const Schema = mongoose.Schema;         // define schema 

// create a new schema
const issueSchema = new Schema ({
    issue: {
        type: String,
        required: true
    },
    solution:{
        type: String,
        required: false
    },
    time: {
        type: Number,
        required: true
    }
});


// create a model for the created schema
// Define the name of schema. It should be a singular
const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;