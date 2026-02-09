const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  topics: {
    type: Number,
    default: 0
  }
}, { _id: true });

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  // Class Association
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  // Teaching Details
  hoursPerWeek: {
    type: Number,
    default: 0
  },
  // Curriculum
  chapters: [chapterSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total chapters
subjectSchema.virtual('totalChapters').get(function() {
  return this.chapters ? this.chapters.length : 0;
});

// Index
subjectSchema.index({ code: 1 });
subjectSchema.index({ classId: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
