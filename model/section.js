const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  section: {
    type: String,
    required: [true, "Please provide section name"],
    minLength: 1,
    maxLength: 40,
    uppercase:true,
    unique:true
  },
  enabled:{
      type:Boolean,
      default:true
  }
});

module.exports = mongoose.model('section', sectionSchema);