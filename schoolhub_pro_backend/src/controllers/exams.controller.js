const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId, subjectId, status } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (status) query.status = status;
    const result = await paginate(Exam, query, {
      page, limit,
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'subjectId', select: 'name code' },
        { path: 'semesterId', select: 'name' }
      ]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('classId', 'name')
      .populate('subjectId', 'name code')
      .populate('semesterId', 'name');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const [studentsEnrolled, resultsCount] = await Promise.all([
      Student.countDocuments({ classId: exam.classId }),
      ExamResult.countDocuments({ examId: exam._id })
    ]);

    res.json({ success: true, data: { ...exam.toObject(), studentsEnrolled, studentsCompleted: resultsCount } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, message: 'Exam created', data: exam });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam updated', data: exam });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    await ExamResult.deleteMany({ examId: req.params.id });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) { next(err); }
};

exports.getResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ examId: req.params.id })
      .populate('studentId', 'name studentId rollNumber');
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

exports.enterMarks = async (req, res, next) => {
  try {
    const { marks } = req.body; // Array of { studentId, marksObtained, remarks }
    const results = await Promise.all(marks.map(async (m) => {
      return ExamResult.findOneAndUpdate(
        { examId: req.params.id, studentId: m.studentId },
        { ...m, examId: req.params.id },
        { new: true, upsert: true, runValidators: true }
      );
    }));
    res.json({ success: true, message: 'Marks entered', data: results });
  } catch (err) { next(err); }
};
