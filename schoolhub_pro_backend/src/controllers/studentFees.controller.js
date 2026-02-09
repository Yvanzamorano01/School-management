const StudentFee = require('../models/StudentFee');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, studentId, status, academicYearId } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (academicYearId) query.academicYearId = academicYearId;
    const result = await paginate(StudentFee, query, {
      page, limit,
      populate: [
        { path: 'studentId', select: 'name studentId' },
        { path: 'feeTypeId', select: 'name frequency' },
        { path: 'academicYearId', select: 'name' }
      ]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const fee = await StudentFee.findById(req.params.id)
      .populate('studentId', 'name studentId classId')
      .populate('feeTypeId', 'name frequency amount')
      .populate('academicYearId', 'name');
    if (!fee) return res.status(404).json({ success: false, message: 'Student fee not found' });
    res.json({ success: true, data: fee });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const fee = await StudentFee.create(req.body);
    res.status(201).json({ success: true, message: 'Student fee created', data: fee });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const fee = await StudentFee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fee) return res.status(404).json({ success: false, message: 'Student fee not found' });
    res.json({ success: true, message: 'Student fee updated', data: fee });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const fee = await StudentFee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Student fee not found' });
    res.json({ success: true, message: 'Student fee deleted' });
  } catch (err) { next(err); }
};

exports.getByStudent = async (req, res, next) => {
  try {
    const fees = await StudentFee.find({ studentId: req.params.studentId })
      .populate('feeTypeId', 'name frequency')
      .populate('academicYearId', 'name');
    const totalAmount = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const paidAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    res.json({ success: true, data: { fees, summary: { totalAmount, paidAmount, balance: totalAmount - paidAmount } } });
  } catch (err) { next(err); }
};
