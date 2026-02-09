const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Section = require('../models/Section');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId, search } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (search) query.name = { $regex: search, $options: 'i' };
    const result = await paginate(Subject, query, {
      page, limit,
      populate: [{ path: 'classId', select: 'name' }]
    });

    // Add studentsEnrolled and teachersAssigned counts
    const subjectsWithCounts = await Promise.all(result.data.map(async (subject) => {
      const subjectObj = subject.toObject();
      // Count students in the same class
      const studentsEnrolled = subjectObj.classId?._id
        ? await Student.countDocuments({ classId: subjectObj.classId._id })
        : 0;
      // Count unique teachers assigned to this subject in sections of the same class
      let teachersAssigned = 0;
      if (subjectObj.classId?._id) {
        const sections = await Section.find({ classId: subjectObj.classId._id });
        const teacherIds = new Set();
        sections.forEach(sec => {
          (sec.teachers || []).forEach(t => {
            if (t.subject && t.subject.toLowerCase() === subjectObj.name.toLowerCase() && t.teacherId) {
              teacherIds.add(t.teacherId.toString());
            }
          });
        });
        teachersAssigned = teacherIds.size;
      }
      return { ...subjectObj, studentsEnrolled, teachersAssigned };
    }));

    res.json({ success: true, data: subjectsWithCounts, pagination: result.pagination });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('classId', 'name');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const subjectObj = subject.toObject();
    const studentsEnrolled = subjectObj.classId?._id
      ? await Student.countDocuments({ classId: subjectObj.classId._id })
      : 0;
    let teachersAssigned = 0;
    if (subjectObj.classId?._id) {
      const sections = await Section.find({ classId: subjectObj.classId._id });
      const teacherIds = new Set();
      sections.forEach(sec => {
        (sec.teachers || []).forEach(t => {
          if (t.subject && t.subject.toLowerCase() === subjectObj.name.toLowerCase() && t.teacherId) {
            teacherIds.add(t.teacherId.toString());
          }
        });
      });
      teachersAssigned = teacherIds.size;
    }

    res.json({ success: true, data: { ...subjectObj, studentsEnrolled, teachersAssigned } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, message: 'Subject created', data: subject });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject updated', data: subject });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) { next(err); }
};
