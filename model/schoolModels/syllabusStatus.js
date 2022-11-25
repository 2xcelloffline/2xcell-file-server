const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syllabusStatusSchema = new Schema({
    schoolId: mongoose.Types.ObjectId,
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradeSection' },
    subjectId: mongoose.Types.ObjectId,
    resourceParentId: mongoose.Types.ObjectId,
    resourceType: {
        type: String,
        enum: {
            values: ['chapter', 'topic', 'module'],
            message: 'Invalid resource type!'
        }
    },
    resourceId: { type: mongoose.Types.ObjectId, refPath: 'resourceType' },
    user:{
        type: String,
        enum: {
            values: ['staff', 'student'],
            message: 'Invalid user type!'
        }
    },
    userId: { type: mongoose.Types.ObjectId, refPath: 'users' },
    createdAt: Date
});

module.exports = mongoose.model('syllabusStatus', syllabusStatusSchema);