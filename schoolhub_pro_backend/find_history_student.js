const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const StudentHistory = require('./src/models/StudentHistory');
const AcademicYear = require('./src/models/AcademicYear');
const Class = require('./src/models/Class');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const findStudentWithHistory = async () => {
    try {
        await connectDB();

        // Find ALL history records
        const histories = await StudentHistory.find().populate('studentId classId academicYearId');

        console.log(`\nTotal History Records Found: ${histories.length}`);

        if (histories.length > 0) {
            console.log('Students with history:');
            for (const h of histories) {
                if (h.studentId) {
                    console.log(`- Student: ${h.studentId.name} (ID: ${h.studentId._id})`);
                    console.log(`  History: Was in ${h.classId?.name} during ${h.academicYearId?.name}`);
                    console.log(`  Current Class: ${h.studentId.classId}`); // Just checking ID for now
                    console.log('---');
                }
            }
        } else {
            console.log('No students have history records yet.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

findStudentWithHistory();
