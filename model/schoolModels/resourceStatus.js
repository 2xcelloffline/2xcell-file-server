const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceStatusSchema = Schema({
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradeSection' },
    subjectId: mongoose.Types.ObjectId,
    chapterId: mongoose.Types.ObjectId,
    topicId: mongoose.Types.ObjectId,
    userId: { type: mongoose.Types.ObjectId, ref: 'student' },
    resourceId: { type: mongoose.Types.ObjectId, ref: 'module' },
    status:String,
    videoDuration: { type: Number, required: [true, 'Please provide resource duration'] },
    duration: { type: Number, default: 0 },
    startedAt: Date
});

module.exports = mongoose.model('resourcestatus', resourceStatusSchema);