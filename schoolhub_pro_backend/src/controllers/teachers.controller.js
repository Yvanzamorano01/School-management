const Teacher = require('../models/Teacher');
const User = require('../models/User');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const result = await paginate(Teacher, query, {
      page, limit,
      populate: [{ path: 'classIds', select: 'name' }]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('classIds', 'name');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: teacher });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, subjects, classIds, qualification, experience, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create teacher profile
    const teacher = await Teacher.create({
      name,
      email,
      phone,
      subjects,
      classIds,
      qualification,
      experience,
      status: 'Active',
      joinDate: new Date()
    });

    // Create user account for login
    const user = await User.create({
      email,
      password: password || 'teacher123',
      role: 'teacher',
      profileId: teacher._id,
      profileModel: 'Teacher',
      isActive: true
    });

    // Link user to teacher
    teacher.userId = user._id;
    await teacher.save();

    res.status(201).json({ success: true, message: 'Teacher created', data: teacher });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { email, ...updateData } = req.body;
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // If email is changing, check for duplicates and update User
    if (email && email !== teacher.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updateData.email = email;

      if (teacher.userId) {
        await User.findByIdAndUpdate(teacher.userId, { email });
      }
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classIds', 'name');

    res.json({ success: true, message: 'Teacher updated', data: updatedTeacher });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Delete associated user account
    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) { next(err); }
};
