const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Academic year name is required'],
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Completed'],
    default: 'Upcoming'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for semesters count
academicYearSchema.virtual('semestersCount', {
  ref: 'Semester',
  localField: '_id',
  foreignField: 'academicYearId',
  count: true
});

// Validation: endDate must be after startDate
academicYearSchema.pre('save', function() {
  if (this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
});

// Only one active academic year at a time
academicYearSchema.pre('save', async function() {
  if (this.status === 'Active' && this.isModified('status')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, status: 'Active' },
      { status: 'Completed' }
    );
  }
});

// Index
academicYearSchema.index({ status: 1 });

module.exports = mongoose.model('AcademicYear', academicYearSchema);
