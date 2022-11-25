const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  school: { type: mongoose.Types.ObjectId, ref: "school" },
  name: {
    type: String,
    required: [true, "Please provide name"],
    minLength: 3,
    maxLength: 100,
  },
  profile: {
    fileName: String,
    fileUrl: String,
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: true,
    trim: true,
  },
  contact: {
    type: Number,
    required: true,
    min: [1111111111, "Contact digits is less than 10"],
    max: [9999999999, "Contact digits is more than 10"],
  },
  role: {
    type: String,
    lowercase: true,
    required: true,
    enum: {
      values: ["student"],
      message: "{VALUE} role not available",
    },
  },
  section: { type: String, trim: true },
  grade: { type: String, trim: true },
  signUpDate: Date,
  expiryDate: {
    type: Date,
    required: [true, "Please provide student expiry date"],
    validate: {
      validator: function (expiryDate) {
        return expiryDate > Date.now();
      },
      message: "Expiry Date should be greater than current Date",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  verificationCode: {
    type: Number,
    select: false,
  },
  verificationCodeExpiresIn: {
    type: Date,
    select: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  loggedAt: Date,
  loginExpiresAt: Date,
  trial: {
    type: Boolean,
    default: true,
  },
  joinedWithCode: {
    type: Boolean,
    default: false,
  },
});


module.exports = mongoose.model("student", studentSchema);
