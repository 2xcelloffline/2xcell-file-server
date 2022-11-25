const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "staff" },
  schoolId: { type: mongoose.Types.ObjectId, ref: "school" },
  announcement: {
    required: true,
    type: String,
    minlength: [1, "announcement should be greater than 1 characters"],
    maxlength: [500, "announcement should be smaller than 300 characters!"],
    trim: true,
  },
  comments: [
    {
      userId: { type: mongoose.Types.ObjectId, refPath: "user" },
      user: {
        type: String,
        values: ["staff", "student"],
        message: "Invalid user",
      },
      comment: String,
      commentAt: Date,
    },
  ],
  grade: String,
  section: String,
  receiver: String,
  subjectId: { type: mongoose.Types.ObjectId, ref: "subject" },
  createdAt: Date,
});

module.exports = mongoose.model("announcement", announcementSchema);
