const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  feeTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType',
    required: [true, 'Fee type is required']
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear'
  },
  // Amount Details
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date
  },
  // Status - calculated based on amounts
  status: {
    type: String,
    enum: ['Paid', 'Partially Paid', 'Unpaid', 'Overdue'],
    default: 'Unpaid'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for balance
studentFeeSchema.virtual('balance').get(function() {
  return this.totalAmount - this.paidAmount;
});

// Update status based on payments
studentFeeSchema.pre('save', function() {
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partially Paid';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Unpaid';
  }
});

// Index
studentFeeSchema.index({ studentId: 1 });
studentFeeSchema.index({ status: 1 });
studentFeeSchema.index({ academicYearId: 1 });

module.exports = mongoose.model('StudentFee', studentFeeSchema);
