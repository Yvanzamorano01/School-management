const FeeType = require('../models/FeeType');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, isActive, classId } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (classId) query.classId = classId;
    const result = await paginate(FeeType, query, {
      page, limit,
      populate: [{ path: 'classId', select: 'name' }]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const feeType = await FeeType.findById(req.params.id).populate('classId', 'name');
    if (!feeType) return res.status(404).json({ success: false, message: 'Fee type not found' });
    res.json({ success: true, data: feeType });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const feeType = await FeeType.create(req.body);
    res.status(201).json({ success: true, message: 'Fee type created', data: feeType });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const feeType = await FeeType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!feeType) return res.status(404).json({ success: false, message: 'Fee type not found' });
    res.json({ success: true, message: 'Fee type updated', data: feeType });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const feeType = await FeeType.findByIdAndDelete(req.params.id);
    if (!feeType) return res.status(404).json({ success: false, message: 'Fee type not found' });
    res.json({ success: true, message: 'Fee type deleted' });
  } catch (err) { next(err); }
};
