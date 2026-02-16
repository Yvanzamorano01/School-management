const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
const StudentHistory = require('../models/StudentHistory');
const AcademicYear = require('../models/AcademicYear');
const paginate = require('../utils/pagination');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId, sectionId, status, search, parentId } = req.query;

    const query = {};
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (status) query.status = status;
    if (parentId) query.parentId = parentId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await paginate(Student, query, {
      page,
      limit,
      populate: [
        { path: 'classId', select: 'name code' },
        { path: 'sectionId', select: 'name room' }
      ]
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classId', 'name code')
      .populate('sectionId', 'name room')
      .populate('parentId', 'name phone email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin
exports.create = async (req, res, next) => {
  try {
    const {
      name, email, phone, dateOfBirth, gender, bloodGroup, address, rollNumber,
      classId, sectionId, parentId, parentName, parentContact, parentEmail,
      relationship, password
    } = req.body;

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Create student profile
    const student = await Student.create({
      name, email, phone, dateOfBirth, gender, bloodGroup, address, rollNumber,
      classId, sectionId, parentId, parentName, parentContact, parentEmail,
      relationship, status: 'Active', admissionDate: new Date()
    });

    // Create user account for login (if email provided)
    if (email) {
      const user = await User.create({
        email,
        password: password || 'student123',
        role: 'student',
        profileId: student._id,
        profileModel: 'Student',
        isActive: true
      });

      student.userId = user._id;
      await student.save();
    }

    // Update parent's childrenIds if parentId provided
    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, {
        $addToSet: { childrenIds: student._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.update = async (req, res, next) => {
  try {
    const { email, parentId, ...updateData } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // If email is changing, check for duplicates and update User
    if (email && email !== student.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updateData.email = email;

      if (student.userId) {
        await User.findByIdAndUpdate(student.userId, { email });
      }
    }

    // If parent is changing, update parent's childrenIds
    if (parentId && parentId !== student.parentId?.toString()) {
      // Remove from old parent
      if (student.parentId) {
        await Parent.findByIdAndUpdate(student.parentId, {
          $pull: { childrenIds: student._id }
        });
      }
      // Add to new parent
      await Parent.findByIdAndUpdate(parentId, {
        $addToSet: { childrenIds: student._id }
      });
      updateData.parentId = parentId;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classId sectionId');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.delete = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete associated user account
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    // Remove from parent's childrenIds
    if (student.parentId) {
      await Parent.findByIdAndUpdate(student.parentId, {
        $pull: { childrenIds: student._id }
      });
    }

    // Delete related data (optional - can be kept for historical records)
    // await ExamResult.deleteMany({ studentId: student._id });
    // await StudentFee.deleteMany({ studentId: student._id });

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's exam results
// @route   GET /api/students/:id/results
// @access  Private
exports.getResults = async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    let examIds = null;

    // If academicYearId is provided, find all exams for that year
    if (academicYearId) {
      const Semester = require('../models/Semester');
      const Exam = require('../models/Exam');

      const semesters = await Semester.find({ academicYearId });
      const semesterIds = semesters.map(s => s._id);

      const exams = await Exam.find({ semesterId: { $in: semesterIds } });
      examIds = exams.map(e => e._id);
    }

    const query = { studentId: req.params.id };
    if (examIds) {
      query.examId = { $in: examIds };
    }

    const results = await ExamResult.find(query)
      .populate({
        path: 'examId',
        populate: [
          { path: 'subjectId', select: 'name code' },
          { path: 'classId', select: 'name' },
          { path: 'semesterId', select: 'name academicYearId' }
        ]
      })
      .sort({ createdAt: -1 });

    // Calculate rank among classmates
    let rank = null;
    let totalStudents = null;
    const student = await Student.findById(req.params.id);
    if (student && student.classId && results.length > 0) {
      const resultExamIds = results.map(r => r.examId?._id).filter(Boolean);
      if (resultExamIds.length > 0) {
        const classmates = await Student.find({ classId: student.classId, status: 'Active' });
        const classmateIds = classmates.map(s => s._id);

        const allResults = await ExamResult.find({
          studentId: { $in: classmateIds },
          examId: { $in: resultExamIds }
        });

        const studentTotals = {};
        for (const r of allResults) {
          const sid = r.studentId.toString();
          if (!studentTotals[sid]) studentTotals[sid] = 0;
          studentTotals[sid] += r.marksObtained;
        }

        const sorted = Object.entries(studentTotals).sort((a, b) => b[1] - a[1]);
        rank = sorted.findIndex(([sid]) => sid === req.params.id) + 1;
        totalStudents = sorted.length;
      }
    }

    res.json({
      success: true,
      data: { results, rank, totalStudents }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's attendance
// @route   GET /api/students/:id/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const query = {
      classId: student.classId,
      'records.studentId': req.params.id
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 });

    // Extract student's attendance from records
    const studentAttendance = attendance.map(a => ({
      date: a.date,
      status: a.records.find(r => r.studentId.toString() === req.params.id)?.status || 'absent'
    }));

    // Calculate summary
    const total = studentAttendance.length;
    const present = studentAttendance.filter(a => a.status === 'present').length;
    const absent = studentAttendance.filter(a => a.status === 'absent').length;
    const late = studentAttendance.filter(a => a.status === 'late').length;

    res.json({
      success: true,
      data: {
        records: studentAttendance,
        summary: {
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? Math.round((present + late) / total * 100) : 0
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's fees
// @route   GET /api/students/:id/fees
// @access  Private
exports.getFees = async (req, res, next) => {
  try {
    const fees = await StudentFee.find({ studentId: req.params.id })
      .populate('feeTypeId', 'name frequency')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalAmount = fees.reduce((sum, f) => sum + f.totalAmount, 0);
    const paidAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const balance = totalAmount - paidAmount;

    res.json({
      success: true,
      data: {
        fees,
        summary: {
          totalAmount,
          paidAmount,
          balance
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Promote students to a new class/section
// @route   POST /api/students/promote
// @access  Private/Admin
exports.promoteStudents = async (req, res, next) => {
  try {
    const { studentIds, classId, sectionId, remarks } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected for promotion' });
    }

    if (!classId || !sectionId) {
      return res.status(400).json({ success: false, message: 'Target class and section are required' });
    }

    // Find the current active academic year to record history against
    const activeYear = await AcademicYear.findOne({ status: { $in: ['Active', 'Completed'] } }).sort({ createdAt: -1 });
    if (!activeYear) {
      return res.status(400).json({ success: false, message: 'No active or completed academic year found to record history' });
    }

    // Find students to get their CURRENT class/section info
    const students = await Student.find({ _id: { $in: studentIds } });

    // Prepare history records
    const historyRecords = students.map(student => ({
      studentId: student._id,
      academicYearId: activeYear._id,
      classId: student.classId,
      sectionId: student.sectionId,
      status: 'Promoted',
      remarks: remarks || `Promoted to new class on ${new Date().toLocaleDateString()}`,
      promotionDate: new Date()
    }));

    // Save history records
    if (historyRecords.length > 0) {
      await StudentHistory.insertMany(historyRecords);
    }

    // Update students to new class
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $set: {
          classId,
          sectionId
        }
      }
    );

    res.json({
      success: true,
      message: `Successfully promoted ${result.modifiedCount} student(s) and recorded history`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's academic history
// @route   GET /api/students/:id/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const history = await StudentHistory.find({ studentId: req.params.id })
      .populate('academicYearId', 'name')
      .populate('classId', 'name code')
      .populate('sectionId', 'name room')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};
