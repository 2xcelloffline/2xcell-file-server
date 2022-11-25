const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schoolSchema = new Schema({
    name: {
        type: String,
        required: [true, "School must have a name"],
        maxlength: [100, 'A school name must have less or equal 100 characters'],
        minlength: [2, 'A school name must have more or equal to 2 characters'],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Please provide school country"]
    },
    state: {
        type: String,
        required: [true, "Please provide school state"]
    },
    city: {
        type: String,
        required: [true, "Please provide school city"]
    },
    branch: {
        type: String,
        required: [true, "Please provide school branch"]
    },
    board: {
        type: String,
        required: [true, "Please provide school board"]
    },
    teacherCounts: {
        type: Number,
        default: 0
    },
    teacherRegistered: {
        type: Number,
        default: 0
    },
    studentCounts: {
        type: Number,
        default: 0
    },
    studentRegistered: {
        type: Number,
        default: 0
    },
    courses: [{
        type: mongoose.Types.ObjectId, ref: 'course'
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expiryDate: {
        type: Date,
        required: [true, "Please provide school expiry date"],
        validate: {
            validator: function (expiryDate) {
                return expiryDate > Date.now()
            },
            message: "Expiry Date should be greater than current Date",
        },
    },
    enabled: {
        type: Boolean,
        default: true
    },
    removed: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('school', schoolSchema);
