const mongoose = require('mongoose');

const feeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee type name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  frequency: {
    type: String,
    enum: ['Annual', 'Semester', 'Quarterly', 'Monthly', 'One-time'],
    default: 'Annual'
  },
  // Optional class association (null means applies to all classes)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
feeTypeSchema.index({ isActive: 1 });
feeTypeSchema.index({ classId: 1 });

module.exports = mongoose.model('FeeType', feeTypeSchema);
