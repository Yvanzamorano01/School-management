const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },
  // Subject & Class
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester'
  },
  // Exam Details
  date: {
    type: Date,
    required: [true, 'Exam date is required']
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required']
  },
  passingMarks: {
    type: Number
  },
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for students enrolled (from class)
examSchema.virtual('studentsEnrolled', {
  ref: 'Student',
  localField: 'classId',
  foreignField: 'classId',
  count: true
});

// Virtual for results count
examSchema.virtual('resultsCount', {
  ref: 'ExamResult',
  localField: '_id',
  foreignField: 'examId',
  count: true
});

// Set default passing marks if not provided
examSchema.pre('save', function() {
  if (!this.passingMarks && this.totalMarks) {
    this.passingMarks = Math.ceil(this.totalMarks * 0.4); // 40% passing
  }
});

// Index
examSchema.index({ classId: 1, date: 1 });
examSchema.index({ status: 1 });

module.exports = mongoose.model('Exam', examSchema);
