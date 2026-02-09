const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  parentId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Parent name is required'],
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
    required: [true, 'Phone number is required'],
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  // Personal Info
  occupation: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Children Relations
  childrenIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  // User account reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate parentId before save
parentSchema.pre('save', async function() {
  if (!this.parentId) {
    const count = await this.constructor.countDocuments();
    this.parentId = `PAR${String(count + 1).padStart(3, '0')}`;
  }
});

// Index
parentSchema.index({ name: 'text' });

module.exports = mongoose.model('Parent', parentSchema);
