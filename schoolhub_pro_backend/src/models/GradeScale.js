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

// Validation: maxScore must be >= minScore, and no overlapping ranges
gradeScaleSchema.pre('save', async function() {
  if (this.maxScore < this.minScore) {
    throw new Error('Maximum score must be greater than or equal to minimum score');
  }

  // Check for overlapping score ranges with existing grades
  const overlapping = await mongoose.model('GradeScale').findOne({
    _id: { $ne: this._id },
    minScore: { $lte: this.maxScore },
    maxScore: { $gte: this.minScore }
  });
  if (overlapping) {
    throw new Error(`Score range ${this.minScore}-${this.maxScore} overlaps with grade ${overlapping.grade} (${overlapping.minScore}-${overlapping.maxScore})`);
  }
});

// Index for range queries
gradeScaleSchema.index({ minScore: 1, maxScore: 1 });

module.exports = mongoose.model('GradeScale', gradeScaleSchema);
