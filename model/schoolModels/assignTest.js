const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignTestSchema = Schema({
    questionSet: {
        required: [true, "Please provide test to assign"],
        type: mongoose.Types.ObjectId,
        ref: 'test'
    },
    testType: {
        type: String,
        required: [true, "Please Provide Test Type"]
    },
    from: {
        type: Date,
        required: [true, "Please provide test start date"],
    },
    to: {
        type: Date,
        required: [true, "Please provide test end date"],
        validate: {
            validator: function (endDate) {
                return endDate >= Date.now()
            },
            message: "Test end date should be greater than current Date",
        }
    },
    duration: { 
        type: Number, 
        min:[120000, "Duration should be greater than 1 min"],
        required: [true, "Please provide test duration!"] 
    },
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradeSection' },
    subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
    chapterId: { type: mongoose.Types.ObjectId, ref: 'chapter' },
    topicId: { type: mongoose.Types.ObjectId, ref: 'topic' },
    creatorId: { type: mongoose.Types.ObjectId, ref: 'staff' },
    visibilityStatus: {
        type: String,
        enum: {
            values: ['private', 'publicForSchool', 'publicForAll'],
            message: `Invalid Visibility Status`
        },
        default: 'private'
    },
    submissions: [{ type: mongoose.Types.ObjectId, ref: 'testsubmission' }],
    createdAt: Date
});

assignTestSchema.methods.testStatus = function () {
    if (new Date(this.to).getTime() <= Date.now())
        return "ENDED";
    if (new Date(this.from).getTime() > Date.now()) {
        return "WAITING";
    }
}

module.exports = mongoose.model('assignTest', assignTestSchema);