const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionStatsSchema = new Schema({
    questionId: { type: mongoose.Types.ObjectId, ref: 'questions' },
    practiceSessionId: { type: mongoose.Types.ObjectId, ref: 'practiceSession' },
    userId: { type: mongoose.Types.ObjectId, ref: 'student' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradeSection' },
    attempts: [{
        attemptNo: { type: Number },
        timeTaken: Number,
        selectedAnswer: { type: Object },
        correct: Boolean,
    }],
    attempt: {
        type: String,
        enum: {
            values: ["passed", "failed"],
            message: "Invalid attempt"
        },
        default: "failed"
    },
    marks: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('questionStats', QuestionStatsSchema);