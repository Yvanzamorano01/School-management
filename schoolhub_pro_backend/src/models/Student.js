const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  phone: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', '']
  },
  address: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  // Academic Relations
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section is required']
  },
  // Parent Relation
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  },
  // Denormalized parent info for quick access
  parentName: {
    type: String,
    trim: true
  },
  parentContact: {
    type: String,
    trim: true
  },
  parentEmail: {
    type: String,
    trim: true
  },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian', '']
  },
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Transferred'],
    default: 'Active'
  },
  admissionDate: {
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

// Auto-generate studentId before save
studentSchema.pre('save', async function() {
  if (!this.studentId) {
    const count = await this.constructor.countDocuments();
    this.studentId = `STU${String(count + 1).padStart(3, '0')}`;
  }
});

// Index for faster queries
studentSchema.index({ classId: 1, sectionId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ name: 'text' });

module.exports = mongoose.model('Student', studentSchema);
