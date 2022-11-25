const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testSchema = new Schema({
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradesection' },
    creatorId: { type: mongoose.Types.ObjectId, refPath: 'onModel' },
    subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
    chapters: [{ type: mongoose.Types.ObjectId, ref: 'chapter' }],
    topics: [{ type: mongoose.Types.ObjectId, ref: 'topic' }],
    onModel: {
        type: String,
        enum: {
            values: ['staff'],
            message: "Invalid user!"
        },
        default: 'staff'
    },
    title: {
        type: String,
        required: [true, "Please provide test title"]
    },
    description: {
        type: String,
        minlength: 0,
        maxLength: [250, "Max length should be less than 250"]
    },
    thumbnail: String,
    testType: {
        type: String,
        values: ["CT", "UT", "HY", "FT"],
        required: [true, "Please provide test type"]
    },
    questions: [{
        _id: false,
        questionId: {
            type: mongoose.Types.ObjectId,
            ref: 'question',
            required: [true, "Please provide question"]
        },
        marks: {
            type: Number,
            min: [1, "Please provide atleast 1 marks to question"],
            required: [true, "Please provide question marks"]
        }
    }],
    totalQuestions: {
        type: Number,
        min: [1, "Please provide atleast 1 question for test"],
        required: [true, "Questions cannot be empty"]
    },
    totalMarks: {
        type: Number,
        min: [1, "Total Marks should be greater than 0"],
        required: [true, "No question marks added"]
    },
    visibilityStatus: { type: String, values: ["private", "publicForSchool", "publicForAll"] },
});

module.exports = mongoose.model('test', testSchema);