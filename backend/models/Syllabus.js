const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    topicName: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Syllabus', syllabusSchema);