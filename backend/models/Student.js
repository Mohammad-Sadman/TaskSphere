const mongoose = require('mongoose');

// Represents a roster student inside a teacher's section (TeachMate-style).
// Distinct from the app's `User` model, which is the student-facing task manager account.
const studentSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
