const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
    },
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits is required'],
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);