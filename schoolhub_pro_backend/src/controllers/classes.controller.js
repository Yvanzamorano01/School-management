const Class = require('../models/Class');
const Section = require('../models/Section');
const Student = require('../models/Student');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, isActive, search } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const result = await paginate(Class, query, {
      page, limit,
      populate: [{ path: 'academicYearId', select: 'name' }]
    });

    // Add counts for each class
    const classesWithCounts = await Promise.all(result.data.map(async (cls) => {
      const [sectionsCount, studentsCount] = await Promise.all([
        Section.countDocuments({ classId: cls._id }),
        Student.countDocuments({ classId: cls._id })
      ]);
      return { ...cls.toObject(), totalSections: sectionsCount, totalStudents: studentsCount };
    }));

    res.json({ success: true, data: classesWithCounts, pagination: result.pagination });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('academicYearId');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const [sectionsCount, studentsCount] = await Promise.all([
      Section.countDocuments({ classId: cls._id }),
      Student.countDocuments({ classId: cls._id })
    ]);

    res.json({ success: true, data: { ...cls.toObject(), totalSections: sectionsCount, totalStudents: studentsCount } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, message: 'Class created', data: cls });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class updated', data: cls });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const studentsCount = await Student.countDocuments({ classId: req.params.id });
    if (studentsCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete class with enrolled students' });
    }
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    await Section.deleteMany({ classId: req.params.id });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) { next(err); }
};

exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find({ classId: req.params.id }).populate('teachers.teacherId', 'name');
    res.json({ success: true, data: sections });
  } catch (err) { next(err); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ classId: req.params.id }).populate('sectionId', 'name');
    res.json({ success: true, data: students });
  } catch (err) { next(err); }
};
