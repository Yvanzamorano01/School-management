const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Notice content is required']
  },
  // Target Audience
  target: {
    type: String,
    enum: ['All', 'Students', 'Teachers', 'Parents'],
    default: 'All'
  },
  // Priority
  priority: {
    type: String,
    enum: ['High', 'Normal', 'Low'],
    default: 'Normal'
  },
  // Author
  author: {
    type: String,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Publishing
  publishDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Draft'
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index
noticeSchema.index({ status: 1, publishDate: -1 });
noticeSchema.index({ target: 1 });
noticeSchema.index({ priority: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
