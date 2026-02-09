const Semester = require('../models/Semester');
const Exam = require('../models/Exam');

exports.getAll = async (req, res, next) => {
  try {
    const { academicYearId, status } = req.query;
    const query = {};
    if (academicYearId) query.academicYearId = academicYearId;
    if (status) query.status = status;
    const semesters = await Semester.find(query)
      .populate('academicYearId', 'name')
      .sort({ startDate: -1 });

    const semestersWithCounts = await Promise.all(semesters.map(async (sem) => {
      const examsCount = await Exam.countDocuments({ semesterId: sem._id });
      return { ...sem.toObject(), examsCount };
    }));

    res.json({ success: true, data: semestersWithCounts });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('academicYearId', 'name');
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    const exams = await Exam.find({ semesterId: semester._id }).populate('subjectId classId');
    res.json({ success: true, data: { ...semester.toObject(), exams } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const semester = await Semester.create(req.body);
    res.status(201).json({ success: true, message: 'Semester created', data: semester });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.json({ success: true, message: 'Semester updated', data: semester });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });
    res.json({ success: true, message: 'Semester deleted' });
  } catch (err) { next(err); }
};

exports.activate = async (req, res, next) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    // Deactivate other semesters in the same academic year
    await Semester.updateMany(
      { academicYearId: semester.academicYearId, status: 'Active' },
      { status: 'Completed' }
    );

    semester.status = 'Active';
    await semester.save();
    res.json({ success: true, message: 'Semester activated', data: semester });
  } catch (err) { next(err); }
};
