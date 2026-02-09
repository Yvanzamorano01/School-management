const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  // Teaching Info
  subjects: [{
    type: String,
    trim: true
  }],
  classIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  // Qualifications
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  // Employment
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  // User account reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate teacherId before save
teacherSchema.pre('save', async function() {
  if (!this.teacherId) {
    const count = await this.constructor.countDocuments();
    this.teacherId = `TCH${String(count + 1).padStart(3, '0')}`;
  }
});

// Indexes
teacherSchema.index({ status: 1 });
teacherSchema.index({ name: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
