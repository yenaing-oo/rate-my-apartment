const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }   
});

// compile the schema into a model and export it
module.exports = mongoose.model('Review', ReviewSchema);