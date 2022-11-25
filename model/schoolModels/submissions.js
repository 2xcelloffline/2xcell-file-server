const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'student' },
    taskId: { type: mongoose.Types.ObjectId, ref: 'task' },
    resources: [{
        fileName: String,
        fieldName: String,
        fileUrl: String
    }],
    lastDeleteTime: Date,
    submitStatus: {
        type: String,
        enum: {
            values: ['submitted on time', 'submitted late'],
            message: "Invalid Submission"
        }
    },
    submittedAt: Date
});

submissionSchema.methods.setSubmitStatus = function (lastDate, submittedAt) {
    this.submitStatus = new Date(lastDate).getTime() >= new Date(submittedAt).getTime() ? "submitted on time" : "submitted late";
}

exports.Submission = mongoose.model('submission', submissionSchema);

/**
 * @schema To hold the data of test submissions
 * @version 2.0
 * @kailash360
 */
const testSubmissionSchema = new Schema({
    studentId: { type: mongoose.Types.ObjectId, ref: 'student' },
    assignTest: { type: mongoose.Types.ObjectId, ref: 'assignTest' },
    questionSet: { type: mongoose.Types.ObjectId, ref: 'test' },
    totalQuestions: Number,
    correctAnswers: {
        type: Number,
        default: 0
    },
    wrongAnswers: {
        type: Number,
        default: 0
    },
    uncheckedAnswers: {
        type: Number,
        default: 0
    },
    unattemptedAnswers: {
        type: Number,
        default: 0
    },
    answers: [{
        _id: false,
        questionId: { type: mongoose.Types.ObjectId },
        questionType: String,
        difficulty: String,
        cognitive: String,
        startTime: Date,
        timeTaken: Number,
        answer: Object,
        status: String
    }],
    totalMarks: Number,
    totalScore: {
        type: Number,
        default: 0
    },
    startedAt: Date,
    submittedAt: Date,
    duration: Number,
    submissionStatus: {
        type: String,
        enum: {
            values: ["Test In Progress", "done"],
            message: "Invalid status"
        },
        default: "Test In Progress"
    }
});

testSubmissionSchema.methods.timeLeft = function (duration) {
    const endTimeInMs = new Date(this.startedAt).getTime() + (duration + 5000);
    return (endTimeInMs >= Date.now());
}

exports.TestSubmission = mongoose.model('testsubmission', testSubmissionSchema);