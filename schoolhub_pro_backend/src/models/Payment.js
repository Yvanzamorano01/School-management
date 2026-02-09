const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentFeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentFee',
    required: [true, 'Student fee is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be at least 1']
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Check', 'Card'],
    default: 'Cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receivedBy: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Auto-generate receipt number
paymentSchema.pre('save', async function() {
  if (!this.receiptNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.receiptNumber = `RCP${year}${month}${String(count + 1).padStart(4, '0')}`;
  }
});

// After saving payment, update the StudentFee paidAmount
paymentSchema.post('save', async function() {
  const StudentFee = mongoose.model('StudentFee');
  const payments = await this.constructor.find({ studentFeeId: this.studentFeeId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  await StudentFee.findByIdAndUpdate(this.studentFeeId, {
    paidAmount: totalPaid
  });
});

// Index
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ studentFeeId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
