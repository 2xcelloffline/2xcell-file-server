const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    boardId: { type: Schema.Types.ObjectId, ref: 'board' },
    totalSubjects: {
        type: Number,
        default: 0
    },
    subjects: [{
        type: mongoose.Types.ObjectId, ref: 'subject'
    }],
    createdAt: Date
});

module.exports = mongoose.model('course', courseSchema);