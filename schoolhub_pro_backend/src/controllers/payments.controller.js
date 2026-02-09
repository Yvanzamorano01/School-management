const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, studentId, startDate, endDate, paymentMethod } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const result = await paginate(Payment, query, {
      page, limit,
      sort: { paymentDate: -1 },
      populate: [
        { path: 'studentId', select: 'name studentId' },
        { path: 'studentFeeId', select: 'totalAmount paidAmount status', populate: { path: 'feeTypeId', select: 'name' } }
      ]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name studentId classId')
      .populate({ path: 'studentFeeId', populate: { path: 'feeTypeId', select: 'name' } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { studentFeeId, amount } = req.body;

    // Validate payment amount
    const studentFee = await StudentFee.findById(studentFeeId);
    if (!studentFee) return res.status(404).json({ success: false, message: 'Student fee not found' });

    const balance = studentFee.totalAmount - studentFee.paidAmount;
    if (amount > balance) {
      return res.status(400).json({ success: false, message: `Payment amount exceeds balance (${balance})` });
    }

    const payment = await Payment.create({ ...req.body, studentId: studentFee.studentId });
    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Update student fee paidAmount
    const studentFee = await StudentFee.findById(payment.studentFeeId);
    if (studentFee) {
      studentFee.paidAmount -= payment.amount;
      await studentFee.save();
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) { next(err); }
};

exports.getReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name studentId classId sectionId')
      .populate({ path: 'studentFeeId', populate: [{ path: 'feeTypeId' }, { path: 'academicYearId' }] });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};
