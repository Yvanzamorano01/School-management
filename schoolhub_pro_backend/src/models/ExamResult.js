const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: 0
  },
  grade: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  // Calculated fields
  percentage: {
    type: Number
  },
  isPassed: {
    type: Boolean
  }
}, {
  timestamps: true
});

// Calculate percentage and pass/fail before save
examResultSchema.pre('save', async function() {
  if (this.isModified('marksObtained')) {
    const Exam = mongoose.model('Exam');
    const exam = await Exam.findById(this.examId);
    if (exam) {
      this.percentage = (this.marksObtained / exam.totalMarks) * 100;
      this.isPassed = this.marksObtained >= exam.passingMarks;

      // Auto-assign grade if not provided
      if (!this.grade) {
        const GradeScale = mongoose.model('GradeScale');
        const gradeScale = await GradeScale.findOne({
          minScore: { $lte: this.percentage },
          maxScore: { $gte: this.percentage }
        });
        if (gradeScale) {
          this.grade = gradeScale.grade;
        }
      }
    }
  }
});

// Unique constraint: one result per student per exam
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
