const GradeScale = require('../models/GradeScale');

exports.getAll = async (req, res, next) => {
  try {
    const grades = await GradeScale.find().sort({ minScore: -1 });
    res.json({ success: true, data: grades });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const grade = await GradeScale.findById(req.params.id);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade scale not found' });
    res.json({ success: true, data: grade });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const grade = await GradeScale.create(req.body);
    res.status(201).json({ success: true, message: 'Grade scale created', data: grade });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const grade = await GradeScale.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade scale not found' });
    res.json({ success: true, message: 'Grade scale updated', data: grade });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const grade = await GradeScale.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade scale not found' });
    res.json({ success: true, message: 'Grade scale deleted' });
  } catch (err) { next(err); }
};

// Initialize default grade scale
exports.initDefaults = async (req, res, next) => {
  try {
    const count = await GradeScale.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Grade scale already initialized' });
    }

    const defaults = [
      { grade: 'A+', minScore: 95, maxScore: 100, gpaPoints: 4.0, description: 'Excellent' },
      { grade: 'A', minScore: 90, maxScore: 94, gpaPoints: 4.0, description: 'Excellent' },
      { grade: 'A-', minScore: 87, maxScore: 89, gpaPoints: 3.7, description: 'Very Good' },
      { grade: 'B+', minScore: 83, maxScore: 86, gpaPoints: 3.3, description: 'Good' },
      { grade: 'B', minScore: 80, maxScore: 82, gpaPoints: 3.0, description: 'Good' },
      { grade: 'B-', minScore: 77, maxScore: 79, gpaPoints: 2.7, description: 'Above Average' },
      { grade: 'C+', minScore: 73, maxScore: 76, gpaPoints: 2.3, description: 'Average' },
      { grade: 'C', minScore: 70, maxScore: 72, gpaPoints: 2.0, description: 'Average' },
      { grade: 'C-', minScore: 67, maxScore: 69, gpaPoints: 1.7, description: 'Below Average' },
      { grade: 'D', minScore: 60, maxScore: 66, gpaPoints: 1.0, description: 'Pass' },
      { grade: 'F', minScore: 0, maxScore: 59, gpaPoints: 0.0, description: 'Fail' }
    ];

    await GradeScale.insertMany(defaults);
    const grades = await GradeScale.find().sort({ minScore: -1 });
    res.status(201).json({ success: true, message: 'Default grade scale initialized', data: grades });
  } catch (err) { next(err); }
};
