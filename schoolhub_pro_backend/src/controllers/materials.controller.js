const CourseMaterial = require('../models/CourseMaterial');
const paginate = require('../utils/pagination');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, classId, subjectId, type, search } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    const result = await paginate(CourseMaterial, query, {
      page, limit,
      populate: [
        { path: 'classId', select: 'name' },
        { path: 'subjectId', select: 'name code' },
        { path: 'uploadedBy', select: 'name' }
      ]
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findById(req.params.id)
      .populate('classId', 'name')
      .populate('subjectId', 'name code')
      .populate('uploadedBy', 'name email');
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, data: material });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      subjectId: req.body.subjectId,
      classId: req.body.classId
    };

    // Handle file upload from multer
    if (req.file) {
      data.fileName = req.file.originalname;
      data.fileSize = req.file.size;
      data.fileType = req.file.mimetype;
      data.fileUrl = req.file.filename; // stored filename on disk
    }

    // Set uploadedBy: use profileId for teachers, or store the user's name
    if (req.user.profileId) {
      data.uploadedBy = req.user.profileId;
    }

    // Always store the uploader display name for reliable display
    // Try to get name from profile, fallback to email
    let uploaderName = req.user.email;
    if (req.user.profileId && req.user.profileModel) {
      try {
        const ProfileModel = require(`../models/${req.user.profileModel}`);
        const profile = await ProfileModel.findById(req.user.profileId).select('name');
        if (profile?.name) uploaderName = profile.name;
      } catch (e) {
        // Fallback to email
      }
    }
    data.uploadedByName = uploaderName;

    const material = await CourseMaterial.create(data);
    res.status(201).json({ success: true, message: 'Material created', data: material });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, message: 'Material updated', data: material });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    // Delete the actual file from disk
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, message: 'Material deleted' });
  } catch (err) { next(err); }
};

exports.download = async (req, res, next) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    // Increment download count
    material.downloads += 1;
    await material.save();

    // Serve the actual file
    if (material.fileUrl) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'materials', material.fileUrl);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, material.fileName || material.fileUrl);
      }
    }

    res.status(404).json({ success: false, message: 'File not found on server' });
  } catch (err) { next(err); }
};
