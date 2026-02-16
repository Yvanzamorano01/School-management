const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const StudentHistory = require('./src/models/StudentHistory');
const AcademicYear = require('./src/models/AcademicYear');
const Class = require('./src/models/Class');
const Section = require('./src/models/Section');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const debugStudent = async () => {
    try {
        await connectDB();

        const name = "Amadou Diallo";
        const students = await Student.find({ name: new RegExp(name, 'i') }).populate('classId sectionId');
        console.log(`\nFound ${students.length} students matching "${name}":`);

        for (const s of students) {
            const historyCount = await StudentHistory.countDocuments({ studentId: s._id });
            console.log(`- ID: ${s._id}`);
            console.log(`  Name: ${s.name}`);
            console.log(`  Class: ${s.classId?.name} - ${s.sectionId?.name}`);
            console.log(`  History Records: ${historyCount}`);

            if (historyCount > 0) {
                console.log(`  *** THIS IS THE ONE WITH HISTORY ***`);
                const h = await StudentHistory.findOne({ studentId: s._id }).populate('classId');
                console.log(`  -> Latest History: ${h.status} from ${h.classId?.name}`);
            }
            console.log('---');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

debugStudent();
