const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    courseId: { type: mongoose.Types.ObjectId, ref: 'course' },
    name: {
        type: String,
        required: [true, "Please provide subject name"],
    },
    totalChapters: {
        type: Number,
        default: 0
    },
    thumbnail:String,
    chapters: [{
        type: mongoose.Types.ObjectId, ref: 'chapter'
    }],
    lang: {
        type: String,
        default: "english"
    },
    disabled:{
        type:Boolean,
        default:false
    },
    createdAt: Date
});

module.exports = mongoose.model('subject', subjectSchema);