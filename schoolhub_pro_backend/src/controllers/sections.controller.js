const Section = require('../models/Section');
const Student = require('../models/Student');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId } = req.query;
    const query = {};
    if (classId) query.classId = classId;

    const result = await paginate(Section, query, {
      page, limit,
      populate: [
        { path: 'classId', select: 'name code' },
        { path: 'teachers.teacherId', select: 'name' }
      ]
    });

    const sectionsWithCounts = await Promise.all(result.data.map(async (sec) => {
      const enrolled = await Student.countDocuments({ sectionId: sec._id });
      return { ...sec.toObject(), enrolled };
    }));

    res.json({ success: true, data: sectionsWithCounts, pagination: result.pagination });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('classId', 'name code')
      .populate('teachers.teacherId', 'name email');
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    const enrolled = await Student.countDocuments({ sectionId: section._id });
    res.json({ success: true, data: { ...section.toObject(), enrolled } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, message: 'Section created', data: section });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, message: 'Section updated', data: section });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const studentsCount = await Student.countDocuments({ sectionId: req.params.id });
    if (studentsCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete section with enrolled students' });
    }
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) { next(err); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ sectionId: req.params.id });
    res.json({ success: true, data: students });
  } catch (err) { next(err); }
};
