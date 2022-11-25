const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const worksheetSchema = new Schema({
    name: String,
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
    topicId: { type: mongoose.Types.ObjectId, ref: 'topic' },
    resources: [{
        fieldName: String,
        fileName: String,
        fileUrl: String
    }]
});

module.exports = mongoose.model('worksheet', worksheetSchema);