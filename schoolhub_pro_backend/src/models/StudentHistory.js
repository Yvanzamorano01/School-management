const mongoose = require('mongoose');

const studentHistorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    academicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicYear',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    status: {
        type: String,
        enum: ['Promoted', 'Retained', 'Transferred', 'Graduated'],
        default: 'Promoted'
    },
    remarks: {
        type: String,
        trim: true
    },
    promotionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per student per year (optional, but good practice)
// A student can't be promoted twice for the same year technically, but let's keep it flexible for now.
studentHistorySchema.index({ studentId: 1, academicYearId: 1 });

module.exports = mongoose.model('StudentHistory', studentHistorySchema);
