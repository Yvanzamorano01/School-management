const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const ExamResult = require('../models/ExamResult');
const Attendance = require('../models/Attendance');
const StudentFee = require('../models/StudentFee');
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
    const results = await ExamResult.find({ studentId: req.params.id })
      .populate({
        path: 'examId',
        populate: [
          { path: 'subjectId', select: 'name code' },
          { path: 'classId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: results
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
