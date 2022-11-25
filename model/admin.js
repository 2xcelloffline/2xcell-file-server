const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const adminSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell us user name"],
    minLength: 3,
    maxLength: 20,
  },
  profile: {
    fileName: String,
    fileUrl: String
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
  },
  contact: Number,
  role: {
    type: String,
    required: true,
    enum: {
      value: ('super admin'),
      message: "No role available"
    }
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  verificationCode: {
    type: Number,
    select: false
  },
  verificationCodeExpiresIn: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  signUpDate: Date
});

//hashing and confirming password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 2);
  next();
});

//compare password
adminSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword.toString(), userPassword);
};

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

adminSchema.methods.createOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9999);
  this.verificationCode = otp;
  return otp;
};
adminSchema.methods.checkCodeExpiryDate = function () {
  if (!this.verificationCodeExpiresIn) return false;
  return new Date(this.verificationCodeExpiresIn).getTime() > Date.now();
}

adminSchema.methods.tokenPayload = function () {
  return {
    userId: this._id,
    name: this.name,
    role: this.role,
    profile: this.profile
  }
}

module.exports = mongoose.model("admin", adminSchema);