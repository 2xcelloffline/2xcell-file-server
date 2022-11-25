const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
    topicId: { type: mongoose.Types.ObjectId, ref: 'topic' },
    school: { type: mongoose.Types.ObjectId, ref: 'school' },
    section: {
        type: String,
        default: '2xcell'
    },
    creator: { type: mongoose.Types.ObjectId, refPath: 'onModel' },
    onModel: {
        type: String,
        enum: {
            values: ['admin', 'staff'],
            message: "Invalid user!"
        }
    },
    visibleTo: [{
        type: mongoose.Types.ObjectId, ref: 'school'
    }],
    public: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: [true, "Please provide module name"]
    },
    totalResources: {
        type: Number,
        default: 0
    },
    resources: [{
        fieldName: String,
        fileName: String,
        fileUrl: String,
        disabled: {
            type: Boolean,
            default: false
        }
    }],
    lang: {
        type: String,
        default: "english"
    },
    thumbnail: String,
    createdAt: Date,
    disabled: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('module', moduleSchema);