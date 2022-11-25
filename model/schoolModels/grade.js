const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
    grade: {
        type: String,
        required: [true, "Grade must have a name"],
        maxlength: [15, 'A Grade name must have less or equal 15 characters'],
        minlength: [1, 'A Grade name must have more or equal to 1 characters'],
        trim: true
    },
    uniqueGrade: {
        type: String,
        unique: true
    },
    schoolId: { type: mongoose.Types.ObjectId, ref: 'school' },
    sections: [{
        type: mongoose.Types.ObjectId, ref: 'gradeSection'
    }],
    subjects: [{
        _id: false,
        subjectId: mongoose.Types.ObjectId,
        subject: String
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    enabled: {
        type: Boolean,
        default: true
    }
});

gradeSchema.methods.removeDuplicateSections = function (oldSections, newSections) {
    const dupFields = [];
    oldSections.forEach(({ section }) => {
        const index = newSections.findIndex(sec => sec === section);
        if (index >= 0) {
            dupFields.push(newSections[index]);
            newSections.splice(index, 1);
        }
    })
    return { dupFields, duplicate: dupFields.length, newSections }
}

gradeSchema.methods.formatSectionsData = function (grade, sections) {
    return sections.map(section => {
        return {
            schoolId: grade.schoolId,
            grade: grade.grade,
            section,
            subjects: grade.subjects,
        }
    })
}

gradeSchema.methods.removeDuplicateSubjects = function (oldSubjects, newSubjects) {
    const dupFields = [];
    oldSubjects.forEach(subject => {
        const index = newSubjects.findIndex(sub => {
            return (sub.subject === subject.subject && sub.subjectId.toString() === subject.subjectId.toString())
        });
        if (index >= 0) {
            dupFields.push(newSubjects[index].subject);
            newSubjects.splice(index, 1)
        }
    })
    return { dupFields, duplicate: dupFields.length, newSubjects }
}

module.exports = mongoose.model('grade', gradeSchema);