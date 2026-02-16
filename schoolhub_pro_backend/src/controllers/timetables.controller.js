const Timetable = require('../models/Timetable');
const paginate = require('../utils/pagination');

const populateFields = [
  { path: 'classId', select: 'name code' },
  { path: 'sectionId', select: 'name' },
  { path: 'subjectId', select: 'name code' },
  { path: 'teacherId', select: 'name' }
];

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId, sectionId, teacherId, day } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (teacherId) query.teacherId = teacherId;
    if (day) query.day = day;

    const result = await paginate(Timetable, query, {
      page, limit,
      populate: populateFields,
      sort: { day: 1, startTime: 1 }
    });

    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const entry = await Timetable.findById(req.params.id).populate(populateFields);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { classId, sectionId, day, startTime, endTime, subjectId, teacherId, room, type } = req.body;

    // Check for teacher conflict (same teacher, same day, same time)
    if (teacherId && day && startTime) {
      const teacherConflict = await Timetable.findOne({
        teacherId, day, startTime
      });
      if (teacherConflict) {
        return res.status(400).json({
          success: false,
          message: 'Teacher is already assigned to another class at this time'
        });
      }
    }

    // Check for room conflict (same room, same day, same time)
    if (room && day && startTime) {
      const roomConflict = await Timetable.findOne({
        room, day, startTime
      });
      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: 'Room is already in use at this time'
        });
      }
    }

    const entry = await Timetable.create({ classId, sectionId, day, startTime, endTime, subjectId, teacherId, room, type });
    const populated = await entry.populate(populateFields);
    res.status(201).json({ success: true, message: 'Schedule entry created', data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A class is already scheduled at this time slot' });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { day, startTime, teacherId, room } = req.body;

    // Check for teacher conflict
    if (teacherId && day && startTime) {
      const teacherConflict = await Timetable.findOne({
        teacherId, day, startTime,
        _id: { $ne: req.params.id }
      });
      if (teacherConflict) {
        return res.status(400).json({
          success: false,
          message: 'Teacher is already assigned to another class at this time'
        });
      }
    }

    // Check for room conflict
    if (room && day && startTime) {
      const roomConflict = await Timetable.findOne({
        room, day, startTime,
        _id: { $ne: req.params.id }
      });
      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: 'Room is already in use at this time'
        });
      }
    }

    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(populateFields);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, message: 'Schedule entry updated', data: entry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A class is already scheduled at this time slot' });
    }
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, message: 'Schedule entry deleted' });
  } catch (err) { next(err); }
};

// Delete all entries for a class
exports.deleteByClass = async (req, res, next) => {
  try {
    const result = await Timetable.deleteMany({ classId: req.params.classId });
    res.json({ success: true, message: `Deleted ${result.deletedCount} entries` });
  } catch (err) { next(err); }
};
