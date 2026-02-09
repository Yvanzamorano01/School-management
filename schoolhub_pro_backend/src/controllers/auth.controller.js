const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Class = require('../models/Class');
const Section = require('../models/Section');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get profile data based on role
    let profile = null;
    if (user.profileId) {
      switch (user.profileModel) {
        case 'Admin':
          profile = await Admin.findById(user.profileId);
          break;
        case 'Teacher':
          profile = await Teacher.findById(user.profileId);
          break;
        case 'Student':
          profile = await Student.findById(user.profileId).populate('classId sectionId');
          break;
        case 'Parent':
          profile = await Parent.findById(user.profileId).populate('childrenIds');
          break;
      }
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register new user (Admin only creates users)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create profile based on role
    let profile = null;
    let profileModel = null;

    switch (role) {
      case 'super_admin':
      case 'admin':
      case 'moderator':
        profileModel = 'Admin';
        profile = await Admin.create({
          ...profileData,
          email,
          role: role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Moderator'
        });
        break;
      case 'teacher':
        profileModel = 'Teacher';
        profile = await Teacher.create({ ...profileData, email });
        break;
      case 'student':
        profileModel = 'Student';
        profile = await Student.create({ ...profileData, email });
        break;
      case 'parent':
        profileModel = 'Parent';
        profile = await Parent.create({ ...profileData, email });
        break;
      case 'bursar':
        profileModel = 'Admin';
        profile = await Admin.create({
          ...profileData,
          email,
          role: 'Admin',
          permissions: ['Fees', 'Reports']
        });
        break;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      profileId: profile?._id,
      profileModel
    });

    // Update profile with userId
    if (profile) {
      profile.userId = user._id;
      await profile.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    let profile = null;
    if (user.profileId) {
      switch (user.profileModel) {
        case 'Admin':
          profile = await Admin.findById(user.profileId);
          break;
        case 'Teacher':
          profile = await Teacher.findById(user.profileId).populate('classIds');
          break;
        case 'Student':
          profile = await Student.findById(user.profileId).populate('classId sectionId parentId');
          break;
        case 'Parent':
          profile = await Parent.findById(user.profileId).populate('childrenIds');
          break;
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          profile
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify current user's password
// @route   POST /api/auth/verify-password
// @access  Private
exports.verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, message: 'Password verified' });
  } catch (err) {
    next(err);
  }
};

// @desc    Public registration for students, teachers, parents
// @route   POST /api/auth/public-register
// @access  Public
exports.publicRegister = async (req, res, next) => {
  try {
    const { email, password, role, profileData } = req.body;

    // Only allow student, teacher, parent
    const allowedRoles = ['student', 'teacher', 'parent'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Registration is only available for students, teachers and parents'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create profile based on role
    let profile = null;
    let profileModel = null;

    switch (role) {
      case 'teacher':
        profileModel = 'Teacher';
        profile = await Teacher.create({ ...profileData, email });
        break;
      case 'student':
        profileModel = 'Student';
        profile = await Student.create({ ...profileData, email });
        break;
      case 'parent':
        profileModel = 'Parent';
        profile = await Parent.create({ ...profileData, email });
        break;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      profileId: profile?._id,
      profileModel
    });

    // Update profile with userId
    if (profile) {
      profile.userId = user._id;
      await profile.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get classes list for public registration
// @route   GET /api/auth/public-classes
// @access  Public
exports.getPublicClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ status: { $ne: 'inactive' } }).select('name _id').sort('name');
    res.json({ success: true, data: classes });
  } catch (err) {
    next(err);
  }
};

// @desc    Get sections for a class (public registration)
// @route   GET /api/auth/public-sections/:classId
// @access  Public
exports.getPublicSections = async (req, res, next) => {
  try {
    const sections = await Section.find({ classId: req.params.classId }).select('name _id classId').sort('name');
    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
};
