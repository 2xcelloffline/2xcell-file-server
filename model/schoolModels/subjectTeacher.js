const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectTeacherSchema = new Schema({
    school: mongoose.Types.ObjectId,
    sectionId: { type: mongoose.Types.ObjectId, ref: 'gradeSection' },
    grade: String,
    section: String,
    subject: String,
    subjectId: mongoose.Types.ObjectId,
    contentId: mongoose.Types.ObjectId,
    teacherId: { type: mongoose.Types.ObjectId, ref: 'staff' },
    createdAt: Date
});

module.exports = mongoose.model('subjectTeacher', subjectTeacherSchema);