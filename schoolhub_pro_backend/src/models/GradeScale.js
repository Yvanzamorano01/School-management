const mongoose = require('mongoose');

const gradeScaleSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    unique: true,
    trim: true
  },
  minScore: {
    type: Number,
    required: [true, 'Minimum score is required'],
    min: 0,
    max: 100
  },
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: 0,
    max: 100
  },
  gpaPoints: {
    type: Number,
    required: [true, 'GPA points is required'],
    min: 0,
    max: 4
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Validation: maxScore must be >= minScore
gradeScaleSchema.pre('save', function() {
  if (this.maxScore < this.minScore) {
    throw new Error('Maximum score must be greater than or equal to minimum score');
  }
});

// Index for range queries
gradeScaleSchema.index({ minScore: 1, maxScore: 1 });

module.exports = mongoose.model('GradeScale', gradeScaleSchema);
