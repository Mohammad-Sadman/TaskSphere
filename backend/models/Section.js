const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
    },
    roomNumber: {
      type: String,
      default: '',
      trim: true,
    },
    schedule: [scheduleSlotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Section', sectionSchema);