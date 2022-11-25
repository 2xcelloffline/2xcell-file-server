const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = Schema({
    content: {
        type: mongoose.Types.ObjectId,
        refPath: 'onModel'
    },
    url:String,
    onModel: String,
    taskType: {
        type: String,
        required: true,
        enum: {
            values: ['flipped class', 'revision task', 'homework'],
            message: "{VALUE} not available"
        }
    },
    from: {
        type: Date,
        required: [true, "Please provide task start date"],
    },
    to: {
        type: Date,
        required: [true, "Please provide task end date"],
        validate: {
            validator: function (endDate) {
                return endDate > Date.now()
            },
            message: "Task end date should be greater than current Date",
        }
    },
    school: mongoose.Types.ObjectId,
    creator: { type: mongoose.Types.ObjectId, ref:'staff'},
    section: String,
    subject: String,
    chapter: String,
    topic: String,
    submission: {
        type: Boolean,
        default: true
    },
    submittedBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'student'
    }],
    public: {
        type: Boolean,
        default: true
    },
    createdAt: Date
});

module.exports = mongoose.model('task', taskSchema);