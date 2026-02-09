const Notice = require('../models/Notice');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, target, status, priority } = req.query;
    const query = {};
    if (target) query.target = target;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    const result = await paginate(Notice, query, { page, limit, sort: { publishDate: -1, createdAt: -1 } });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    // Increment views
    notice.views += 1;
    await notice.save();
    res.json({ success: true, data: notice });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, authorId: req.userId });
    res.status(201).json({ success: true, message: 'Notice created', data: notice });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, message: 'Notice updated', data: notice });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) { next(err); }
};

exports.publish = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id,
      { status: 'Published', publishDate: new Date() },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, message: 'Notice published', data: notice });
  } catch (err) { next(err); }
};
