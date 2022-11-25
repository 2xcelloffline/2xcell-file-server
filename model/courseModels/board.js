const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardSchema = new Schema({
    countryId: { type: mongoose.Types.ObjectId, ref: 'country' },
    name: {
        type: String,
        required: [true, "Please provide board name"],
    },
    totalCourses: {
        type: Number,
        default: 0
    },
    courses: [{
        type: mongoose.Types.ObjectId,
        ref: 'course'
    }],
    createdAt: Date
});

module.exports = mongoose.model('board', boardSchema);