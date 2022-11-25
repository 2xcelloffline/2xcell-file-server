const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pagevisitSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, refPath: 'onModel' },
    onModel: {
        type: String,
        enum: {
            values: ['staff', 'student'],
            message: 'Invalid role'
        }
    },
    teacher: { type: mongoose.Types.ObjectId, ref: 'staff' },
    role: String,
    school: { type: mongoose.Types.ObjectId, ref: 'school' },
    section: String,
    subject: String,
    chapter: String,
    topic: String,
    module: String,
    visitOn: Date
});

module.exports = mongoose.model('pageVisit', pagevisitSchema);
