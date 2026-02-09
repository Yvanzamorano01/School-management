const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Semester name is required'],
    trim: true
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: [true, 'Academic year is required']
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

// Virtual for exams count
semesterSchema.virtual('examsCount', {
  ref: 'Exam',
  localField: '_id',
  foreignField: 'semesterId',
  count: true
});

// Virtual for days remaining
semesterSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'Active') return null;
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

// Virtual for progress percentage
semesterSchema.virtual('progress').get(function() {
  if (this.status !== 'Active') return this.status === 'Completed' ? 100 : 0;
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const total = end - start;
  const elapsed = now - start;
  const percentage = Math.round((elapsed / total) * 100);
  return Math.min(Math.max(percentage, 0), 100);
});

// Validation
semesterSchema.pre('save', function() {
  if (this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
});

// Only one active semester per academic year
semesterSchema.pre('save', async function() {
  if (this.status === 'Active' && this.isModified('status')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, academicYearId: this.academicYearId, status: 'Active' },
      { status: 'Completed' }
    );
  }
});

// Index
semesterSchema.index({ academicYearId: 1 });
semesterSchema.index({ status: 1 });

module.exports = mongoose.model('Semester', semesterSchema);
