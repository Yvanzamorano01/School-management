const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  // Parent Class
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  // Physical Location
  room: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  // Assigned Teachers
  teachers: [{
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    subject: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for enrolled students count
sectionSchema.virtual('enrolled', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'sectionId',
  count: true
});

// Compound index for uniqueness within a class
sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
