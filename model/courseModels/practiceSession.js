const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const practiceSessionSchema = new Schema({
    studentId: { type: mongoose.Types.ObjectId, ref: 'student' },
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'section' },
    subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
    chapterId: { type: mongoose.Types.ObjectId, ref: 'chapter' },
    topicId: { type: mongoose.Types.ObjectId, ref: 'topic' },
    questions: [{ type: mongoose.Types.ObjectId, ref: 'question' }],
    incorrectQuestions: {
        easy: [{ type: mongoose.Types.ObjectId }],
        intermediate: [{ type: mongoose.Types.ObjectId }],
        hard: [{ type: mongoose.Types.ObjectId }]
    },
    totalQuestionsToAttempt: {
        easy: { type: Number, default: 0 },
        intermediate: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    totalQuestionsAttempted: {
        easy: { type: Number, default: 0 },
        intermediate: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    cognitiveAttempted: {
        knowledge: { type: Number, default: 0 },
        understanding: { type: Number, default: 0 },
        application: { type: Number, default: 0 },
        analysis: { type: Number, default: 0 }
    },
    correct: {
        easy: { type: Number, default: 0 },
        intermediate: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    percentage: {
        easy: { type: Number, default: 0 },
        intermediate: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    difficulty: {
        type: String,
        enum: {
            values: ["easy", "intermediate", "hard"],
            message: "Invalid difficulty!"
        },
        default: 'easy'
    },
    currentQuestion: {
        questionId: { type: mongoose.Types.ObjectId },
        questionStatsId: { type: mongoose.Types.ObjectId },
        attemptLeft: { type: Number },
        marks: Number,
        reAttempt: Boolean
    },
    timeSpend: {
        type: Number,
        default: 0
    },
    status: [{
        _id: false,
        exitedAt: Date
    }],
    score: {
        type: Number,
        default: 0
    },
    createdAt: Date
});

/**
 * @name handleQuestionCounts
 * @param {easy, intermediate, hard} newQuestions
 * @description update question counts and score according to newly added questions
 * @test required
 */
practiceSessionSchema.methods.handleQuestionCounts = function (newQuestionsCount) {
    //Reverse loop to set practice session level in lowest possible difficulty for student t attempt new questions 
    for (count of ['hard', 'intermediate', 'easy']) {
        const newCount = newQuestionsCount[count];
        const notNewCount = (newCount === this.totalQuestionsToAttempt[count]);
        if (!newCount || notNewCount) continue;
        if ((this.totalQuestionsAttempted[count] < newCount)) {
            //Replace previous count with new count if attempted count is smaller then new count
            this.totalQuestionsToAttempt[count] = newCount;
        } else {
            //Update New Count
            this.totalQuestionsToAttempt[count] += newCount;
        }
        //Update score according to new count
        this.percentage[count] = (this.correct[count] / this.totalQuestionsToAttempt[count]) * 100;
        this.difficulty = count;
    }
}

practiceSessionSchema.methods.updatePercentage = function (difficulty) {
    this.percentage[difficulty] = (this.correct[difficulty] / this.totalQuestionsToAttempt[difficulty]) * 100;
}
/**
@name updateLevel
@description update the difficulty of session
 */
practiceSessionSchema.methods.updateLevel = function (passed) {
    const difficulties = ['easy', 'intermediate', 'hard'];
    const difficultyIndex = difficulties.indexOf(this.difficulty);
    //some error occured here
    if ((this.difficulty !== 'hard') && passed) {
        var index = difficultyIndex + 1;
        const nextDifficulty = difficulties[index];
        this.difficulty = !this.totalQuestionsToAttempt[nextDifficulty] ? (difficulties[index + 1] || 'hard') : (nextDifficulty || 'hard')
    }
    return ((this.difficulty == 'hard') && passed);
}

practiceSessionSchema.methods.getLevelStatus = function () {
    const difficulty = this.difficulty;
    return {
        isAllAttempted: (this.totalQuestionsAttempted[difficulty] === this.totalQuestionsToAttempt[difficulty]),
        passed: (this.percentage[difficulty] >= 70),
    }
}

practiceSessionSchema.methods.getIncorrectQuestion = function () {
    const questionId = this.incorrectQuestions[this.difficulty][0];
    this.incorrectQuestions[this.difficulty].splice(0, 1);
    return questionId;
}

practiceSessionSchema.methods.getLevelConfig = function () {
    return {
        "easy": {
            attempts: 2,
            cognitive: ["knowledge"]
        },
        "intermediate": {
            attempts: 2,
            cognitive: ["understanding"]
        },
        "hard": {
            attempts: 1,
            cognitive: ["analysis", "application"]
        }
    }[this.difficulty];
}

module.exports = mongoose.model('practiceSession', practiceSessionSchema);