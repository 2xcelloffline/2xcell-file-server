const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
    name: String,
    userId: mongoose.Types.ObjectId,
    role: String,
    school: mongoose.Types.ObjectId,
    grade: String,
    section: String,
    loggedAt: Date
})

module.exports = mongoose.model('userActivity', userActivitySchema);