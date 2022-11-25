const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'section' },
    subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
    chapterId: { type: mongoose.Types.ObjectId, ref: 'chapter' },
    topicId: { type: mongoose.Types.ObjectId, ref: 'topic' },
    moduleId: { type: mongoose.Types.ObjectId, ref: 'module' },
    question: {
        type: String,
        required: [true, "Please provide the question"],
        unique: true
    },
    questionType: {
        type: String,
        enum: {
            values: ["mcq", "mmcq", "fillup", "oneword", "correctstatement"],
            message: "Invalid Question Types!"
        },
        required: [true, "Please provide type of the question"],
    },
    options: [{
        _id: false,
        optionId: { type: String },
        value: { type: String }
    }],
    difficulty: {
        type: String,
        required: [true, "Please provide the difficulty"],
        enum: {
            values: ["easy", "intermediate", "hard"],
            message: "Invalid difficulty!"
        }
    },
    cognitive: {
        type: String,
        required: [true, "Please provide the cognitive"],
        enum: {
            values: ["knowledge", "analysis", "understanding", "application"],
            message: "Invalid cognitive value status!"
        }
    },
    correctAnswers: { type: Object },
    marks: { type: Number, default: 0 },
    creatorId: {
        type: mongoose.Types.ObjectId,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        enum: {
            values: ['admin', 'staff'],
            message: "Invalid user!"
        }
    },
    images: { type: Object },
    visibilityStatus: {
        type: String,
        required: [true, "Please provide the visibility status"],
        enum: {
            values: ["private", "publicForSchool", "publicForAll"],
            message: "Invalid visibility status!"
        }
    },
    createdAt: Date
});

questionSchema.methods.getMarks = function () {
    const difficulties = { easy: 2, intermediate: 3, hard: 4 };
    const cognitives = { knowledge: 1, understanding: 2, application: 3, analysis: 4 };
    return difficulties[this.difficulty] + cognitives[this.cognitive];
}

questionSchema.methods.getCorrectAnswer = function (isAllAttemptFailed) {
    if (!isAllAttemptFailed) return null;
    let correct = "";
    let questionType = this.questionType;
    let correctAnswer = this.correctAnswers[questionType]
    let options = this.options;
    console.log(typeof correctAnswer);
    switch (questionType) {
        case "mcq":
            correctAnswer = correctAnswer?.replace(/[" "]/g, "");
            var correctIndex = options.findIndex(option => option.optionId === correctAnswer);
            correct = options[correctIndex].value;
            break;
        case "oneword":
            correct = correctAnswer[0].answer;
            break;
        case "correctstatement":
            correctAnswer = correctAnswer?.replace(/[" "]/g, "");
            var correctIndex = options.findIndex(option => option.optionId === correctAnswer);
            correct = options[correctIndex].value;
            break;
        case "mmcq":
            let ans = [];
            for (csAns of correctAnswer) {
                newAns = csAns?.replace(/[" "]/g, "");
                var correctIndex = options.findIndex(option => option.optionId === newAns);
                ans.push(options[correctIndex].value);
            }
            correct = ans.join(', ')
            break;
        case "fillup":
            correct = correctAnswer.map(cAns => cAns.answer).join(', ')
            break;
    }
    return correct;
}

questionSchema.methods.checkAnswer = function ({ questionType, answer, correctAnswer }) {
    console.log("Question Type! ", questionType);
    console.log("Answer", answer);
    console.log("Correct Answer", correctAnswer);
    let passed = false;
    console.log(correctAnswer);
    switch (questionType) {
        case "mcq":
            passed = (correctAnswer === answer);
            break;
        case "oneword":
            passed = (correctAnswer[0].answer.toLowerCase() === answer.toLowerCase())
            break;
        case "correctstatement":
            passed = (correctAnswer === answer)
            break;
        case "mmcq":
            var cAnsCount = 0;
            for (csAns of correctAnswer) {
                const isCorrect = answer.findIndex(ans => (ans === csAns))
                cAnsCount += (isCorrect > -1) ? 1 : 0;
            }
            passed = (correctAnswer.length === cAnsCount);
            break;
        case "fillup":
            for (ans of answer) {
                const isCorrect = correctAnswer.findIndex(blank => (blank.blankId === ans.blankId && blank.answer.toLowerCase() == ans.answer.toLowerCase()))
                passed = (isCorrect > -1);
                if (!passed) break;
            }
            break;
    }
    console.log(`Is Passed`, passed);
    return passed;
}

module.exports = mongoose.model('question', questionSchema);
