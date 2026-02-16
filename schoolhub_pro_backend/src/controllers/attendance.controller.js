const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getAll = async (req, res, next) => {
  try {
    const { classId, sectionId, startDate, endDate, academicYearId } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    if (academicYearId) {
      const AcademicYear = require('../models/AcademicYear');
      const year = await AcademicYear.findById(academicYearId);
      if (year) {
        query.date = { $gte: year.startDate, $lte: year.endDate };
      }
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('recordedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (err) { next(err); }
};

exports.getByDate = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    const attendance = await Attendance.findOne({
      classId, sectionId, date: new Date(date)
    }).populate('records.studentId', 'name studentId rollNumber');
    res.json({ success: true, data: attendance });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { classId, sectionId, date, records } = req.body;

    // Check if attendance already exists for this date
    const existing = await Attendance.findOne({ classId, sectionId, date: new Date(date) });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already recorded for this date' });
    }

    const attendance = await Attendance.create({
      classId, sectionId, date, records,
      recordedBy: req.user.profileId
    });
    res.status(201).json({ success: true, message: 'Attendance recorded', data: attendance });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.json({ success: true, message: 'Attendance updated', data: attendance });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
    res.json({ success: true, message: 'Attendance deleted' });
  } catch (err) { next(err); }
};

exports.getClassSummary = async (req, res, next) => {
  try {
    const { classId, sectionId, month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      classId, sectionId,
      date: { $gte: startDate, $lte: endDate }
    });

    const students = await Student.find({ classId, sectionId });
    const summary = students.map(student => {
      let present = 0, absent = 0, late = 0;
      attendance.forEach(a => {
        const record = a.records.find(r => r.studentId.toString() === student._id.toString());
        if (record) {
          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'late') late++;
        }
      });
      return {
        student: { _id: student._id, name: student.name, studentId: student.studentId },
        present, absent, late, total: attendance.length,
        rate: attendance.length > 0 ? Math.round((present + late) / attendance.length * 100) : 0
      };
    });

    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};

// Get attendance records for a specific student
exports.getByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Find all attendance records that include this student
    const query = { 'records.studentId': studentId };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('classId', 'name')
      .sort({ date: -1 });

    // Extract only this student's records from each attendance document
    const studentAttendance = attendanceRecords.map(record => {
      const studentRecord = record.records.find(r => r.studentId.toString() === studentId);
      return {
        _id: record._id,
        date: record.date,
        status: studentRecord?.status || 'absent',
        remarks: studentRecord?.remarks || '',
        className: record.classId?.name || ''
      };
    });

    res.json({ success: true, data: studentAttendance });
  } catch (err) { next(err); }
};
