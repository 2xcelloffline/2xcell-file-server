const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tools = require('../../utils/tools');
const countrySchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide country name"],
        unique: true,
        minlength:[3, 'Country name should greater than or equal to 3'],
        maxlength:[56, 'Country name should smaller than or equal to 56 character']
    },
    totalBoards: {
        type: Number,
        default: 0
    },
    boards: [{
        type: mongoose.Types.ObjectId,
        ref: 'board'
    }],
    createdAt: Date
});
countrySchema.pre('save', function(next) {
    this.name = tools.capitalizeFirstLetter(this.name);
    next()
})
module.exports = mongoose.model('country', countrySchema);