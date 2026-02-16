const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');

exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const years = await AcademicYear.find(query).sort({ startDate: -1 });

    const yearsWithCounts = await Promise.all(years.map(async (year) => {
      const semestersCount = await Semester.countDocuments({ academicYearId: year._id });
      return { ...year.toObject(), semestersCount };
    }));

    res.json({ success: true, data: yearsWithCounts });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });
    const semesters = await Semester.find({ academicYearId: year._id });
    res.json({ success: true, data: { ...year.toObject(), semesters } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const year = await AcademicYear.create(req.body);
    res.status(201).json({ success: true, message: 'Academic year created', data: year });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });
    res.json({ success: true, message: 'Academic year updated', data: year });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });

    // Cascade: delete exams and results for all semesters of this year
    const semesters = await Semester.find({ academicYearId: req.params.id });
    const semesterIds = semesters.map(s => s._id);
    if (semesterIds.length > 0) {
      const exams = await Exam.find({ semesterId: { $in: semesterIds } });
      const examIds = exams.map(e => e._id);
      if (examIds.length > 0) {
        await ExamResult.deleteMany({ examId: { $in: examIds } });
      }
      await Exam.deleteMany({ semesterId: { $in: semesterIds } });
    }
    await Semester.deleteMany({ academicYearId: req.params.id });

    res.json({ success: true, message: 'Academic year deleted' });
  } catch (err) { next(err); }
};

exports.activate = async (req, res, next) => {
  try {
    // Deactivate all other years
    await AcademicYear.updateMany({ _id: { $ne: req.params.id }, status: 'Active' }, { status: 'Completed' });
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true });
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });
    res.json({ success: true, message: 'Academic year activated', data: year });
  } catch (err) { next(err); }
};
