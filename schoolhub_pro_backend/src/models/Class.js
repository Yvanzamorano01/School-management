const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Academic Year Reference
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  // Subjects taught in this class
  subjects: [{
    type: String,
    trim: true
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total sections
classSchema.virtual('totalSections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'classId',
  count: true
});

// Virtual for total students
classSchema.virtual('totalStudents', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'classId',
  count: true
});

// Index
classSchema.index({ name: 1 });
classSchema.index({ isActive: 1 });

module.exports = mongoose.model('Class', classSchema);
