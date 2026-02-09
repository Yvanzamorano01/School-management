const Parent = require('../models/Parent');
const User = require('../models/User');
const Student = require('../models/Student');
const paginate = require('../utils/pagination');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { parentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const result = await paginate(Parent, query, {
      page, limit,
      populate: [{ path: 'childrenIds', select: 'name studentId classId' }]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate({
        path: 'childrenIds',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' }
        ]
      });
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    res.json({ success: true, data: parent });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, occupation, address, childrenIds, password } = req.body;

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Create parent profile
    const parent = await Parent.create({
      name,
      email,
      phone,
      occupation,
      address,
      childrenIds: childrenIds || [],
      status: 'Active'
    });

    // Create user account for login (if email provided)
    if (email) {
      const user = await User.create({
        email,
        password: password || 'parent123',
        role: 'parent',
        profileId: parent._id,
        profileModel: 'Parent',
        isActive: true
      });

      parent.userId = user._id;
      await parent.save();
    }

    // Update students' parent info only if they don't already have a parent assigned
    if (childrenIds && childrenIds.length > 0) {
      // Students without a parent - set this parent as primary
      await Student.updateMany(
        { _id: { $in: childrenIds }, $or: [{ parentId: { $exists: false } }, { parentId: null }] },
        {
          parentId: parent._id,
          parentName: parent.name,
          parentContact: parent.phone,
          parentEmail: parent.email
        }
      );
    }

    res.status(201).json({ success: true, message: 'Parent created', data: parent });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { email, childrenIds, ...updateData } = req.body;
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // If email is changing, check for duplicates and update User
    if (email && email !== parent.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updateData.email = email;

      if (parent.userId) {
        await User.findByIdAndUpdate(parent.userId, { email });
      }
    }

    // If childrenIds is changing, update student records
    if (childrenIds) {
      // Remove parent from old children
      const oldChildrenIds = parent.childrenIds.map(id => id.toString());
      const newChildrenIds = childrenIds.map(id => id.toString());

      const removedChildren = oldChildrenIds.filter(id => !newChildrenIds.includes(id));
      const addedChildren = newChildrenIds.filter(id => !oldChildrenIds.includes(id));

      // Remove parent reference from removed children (only if this parent is the one assigned)
      if (removedChildren.length > 0) {
        await Student.updateMany(
          { _id: { $in: removedChildren }, parentId: parent._id },
          { $unset: { parentId: 1, parentName: 1, parentContact: 1, parentEmail: 1 } }
        );
      }

      // Add parent reference to new children (only if they don't already have a parent)
      if (addedChildren.length > 0) {
        await Student.updateMany(
          { _id: { $in: addedChildren }, $or: [{ parentId: { $exists: false } }, { parentId: null }] },
          {
            parentId: parent._id,
            parentName: updateData.name || parent.name,
            parentContact: updateData.phone || parent.phone,
            parentEmail: updateData.email || parent.email
          }
        );
      }

      updateData.childrenIds = childrenIds;
    }

    // Update parent info in all linked students
    if (updateData.name || updateData.phone || updateData.email) {
      const updateStudentData = {};
      if (updateData.name) updateStudentData.parentName = updateData.name;
      if (updateData.phone) updateStudentData.parentContact = updateData.phone;
      if (updateData.email) updateStudentData.parentEmail = updateData.email;

      await Student.updateMany(
        { parentId: parent._id },
        updateStudentData
      );
    }

    const updatedParent = await Parent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('childrenIds', 'name studentId');

    res.json({ success: true, message: 'Parent updated', data: updatedParent });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Delete associated user account
    if (parent.userId) {
      await User.findByIdAndDelete(parent.userId);
    }

    // Remove parent reference from all linked students
    await Student.updateMany(
      { parentId: parent._id },
      { $unset: { parentId: 1, parentName: 1, parentContact: 1, parentEmail: 1 } }
    );

    await Parent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Parent deleted' });
  } catch (err) { next(err); }
};

// Get parent's children with details
exports.getChildren = async (req, res, next) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const children = await Student.find({ _id: { $in: parent.childrenIds } })
      .populate('classId', 'name')
      .populate('sectionId', 'name');

    res.json({ success: true, data: children });
  } catch (err) { next(err); }
};
