const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  // Individual student records
  records: [attendanceRecordSchema],
  // Recorded by
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for counts
attendanceSchema.virtual('presentCount').get(function() {
  return this.records ? this.records.filter(r => r.status === 'present').length : 0;
});

attendanceSchema.virtual('absentCount').get(function() {
  return this.records ? this.records.filter(r => r.status === 'absent').length : 0;
});

attendanceSchema.virtual('lateCount').get(function() {
  return this.records ? this.records.filter(r => r.status === 'late').length : 0;
});

attendanceSchema.virtual('totalCount').get(function() {
  return this.records ? this.records.length : 0;
});

attendanceSchema.virtual('attendanceRate').get(function() {
  if (!this.records || this.records.length === 0) return 0;
  const present = this.records.filter(r => r.status === 'present' || r.status === 'late').length;
  return Math.round((present / this.records.length) * 100 * 10) / 10;
});

// Unique constraint: one attendance record per class/section per day
attendanceSchema.index({ classId: 1, sectionId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
