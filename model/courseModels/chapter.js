const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chapterSchema = new Schema({
    subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
    name: {
        type: String,
        required: [true, "Please provide Chapter name"],
    },
    totalTopics: {
        type: Number,
        default: 0
    },
    topics: [{
        type: mongoose.Types.ObjectId,
        ref: 'topic'
    }],
    thumbnail: String,
    trial: {
        type: Boolean,
        default: false
    },
    lang: {
        type: String,
        default: "english"
    },
    disabled: {
        type: Boolean,
        default: false
    },
    createdAt: Date
});

module.exports = mongoose.model('chapter', chapterSchema);