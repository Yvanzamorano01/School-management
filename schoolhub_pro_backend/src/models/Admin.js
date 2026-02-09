const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Admin name is required'],
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
  // Role & Access
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Moderator'],
    required: [true, 'Role is required']
  },
  permissions: [{
    type: String,
    enum: ['All', 'Students', 'Teachers', 'Parents', 'Classes', 'Sections', 'Subjects',
           'Exams', 'Attendance', 'Fees', 'Notices', 'Reports', 'Settings']
  }],
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  lastLogin: {
    type: Date
  },
  // User account reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate adminId before save
adminSchema.pre('save', async function() {
  if (!this.adminId) {
    const count = await this.constructor.countDocuments();
    this.adminId = `ADM${String(count + 1).padStart(3, '0')}`;
  }
});

// Set default permissions based on role
adminSchema.pre('save', function() {
  if (this.isModified('role') && !this.permissions.length) {
    if (this.role === 'Super Admin') {
      this.permissions = ['All'];
    } else if (this.role === 'Admin') {
      this.permissions = ['Students', 'Teachers', 'Parents', 'Classes', 'Sections',
                          'Subjects', 'Exams', 'Attendance', 'Fees', 'Notices', 'Reports'];
    } else if (this.role === 'Moderator') {
      this.permissions = ['Students', 'Parents', 'Notices'];
    }
  }
});

module.exports = mongoose.model('Admin', adminSchema);
