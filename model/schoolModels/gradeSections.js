const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradeSectionSchema = Schema({
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    grade: String,
    courseId: { type: mongoose.Types.ObjectId, ref: 'course' },
    section: String,
    subjects: [{
        subject: String,
        subjectId: { type: mongoose.Types.ObjectId, ref: 'subject' },
        // teacherName: String,
        // teacherId: { type: mongoose.Types.ObjectId, ref: 'teacher' }
    }],
    enabled: {
        type: Boolean,
        default: true
    },
    classCode: {
        type: String,
    },
});

module.exports = mongoose.model('gradeSection', gradeSectionSchema);