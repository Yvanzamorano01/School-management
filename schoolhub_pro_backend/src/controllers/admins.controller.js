const Admin = require('../models/Admin');
const User = require('../models/User');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    const result = await paginate(Admin, query, { page, limit });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, data: admin });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, role, permissions, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create admin profile
    const admin = await Admin.create({
      name,
      email,
      phone,
      role,
      permissions,
      status: 'Active'
    });

    // Determine user role based on admin role
    let userRole = 'moderator';
    if (role === 'Super Admin') userRole = 'super_admin';
    else if (role === 'Admin') userRole = 'admin';

    // Create user account for login
    const user = await User.create({
      email,
      password: password || 'admin123', // Default password if not provided
      role: userRole,
      profileId: admin._id,
      profileModel: 'Admin',
      isActive: true
    });

    // Link user to admin
    admin.userId = user._id;
    await admin.save();

    res.status(201).json({ success: true, message: 'Admin created', data: admin });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { email, role, ...updateData } = req.body;
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // If email is changing, check for duplicates
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updateData.email = email;

      // Update user email too
      if (admin.userId) {
        await User.findByIdAndUpdate(admin.userId, { email });
      }
    }

    // If role is changing, update user role too
    if (role && role !== admin.role) {
      updateData.role = role;
      let userRole = 'moderator';
      if (role === 'Super Admin') userRole = 'super_admin';
      else if (role === 'Admin') userRole = 'admin';

      if (admin.userId) {
        await User.findByIdAndUpdate(admin.userId, { role: userRole });
      }
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Admin updated', data: updatedAdmin });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Prevent deleting Super Admin
    if (admin.role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete Super Admin' });
    }

    // Prevent deleting yourself
    if (req.user.profileId && req.user.profileId.toString() === req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete associated user account
    if (admin.userId) {
      await User.findByIdAndDelete(admin.userId);
    }

    // Delete admin
    await Admin.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) { next(err); }
};
