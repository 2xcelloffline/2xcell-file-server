const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema({
    chapterId: { type: mongoose.Types.ObjectId, ref: 'chapter' },
    name: {
        type: String,
        required: [true, "Please provide Topic name"],
    },
    totalModules: {
        type: Number,
        default: 0
    },
    modules: [{
        type:mongoose.Types.ObjectId,
        ref:'module'
    }],
    thumbnail:String,
    trial: {
        type: Boolean,
        default: false
    },
    lang: {
        type: String,
        default: "english"
    },
    disabled:{
        type:Boolean,
        default:false
    },
    createdAt: Date
});

module.exports = mongoose.model('topic', topicSchema);