const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
})
module.exports = mongoose.model('Comment', CommentSchema);