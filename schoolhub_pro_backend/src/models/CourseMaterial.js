const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Course', 'Assignment', 'Worksheet', 'Solution', 'Other'],
    default: 'Course'
  },
  // Associations
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  // File Info
  fileUrl: {
    type: String
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number // in bytes
  },
  fileType: {
    type: String,
    trim: true
  },
  // Upload Info
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  uploadedByName: {
    type: String,
    trim: true
  },
  // Download tracking
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index
courseMaterialSchema.index({ classId: 1 });
courseMaterialSchema.index({ subjectId: 1 });
courseMaterialSchema.index({ type: 1 });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
