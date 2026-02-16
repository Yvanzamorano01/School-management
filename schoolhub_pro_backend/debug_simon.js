const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const StudentHistory = require('./src/models/StudentHistory');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const debugSimon = async () => {
    try {
        await connectDB();

        const name = "Simon";
        const students = await Student.find({ name: new RegExp(name, 'i') }).populate('classId');
        console.log(`\nFound ${students.length} students matching "${name}":`);

        for (const s of students) {
            const historyCount = await StudentHistory.countDocuments({ studentId: s._id });
            console.log(`- ID: ${s._id}`);
            console.log(`  Name: ${s.name}`);
            console.log(`  Class: ${s.classId?.name}`);
            console.log(`  History Records: ${historyCount}`);
            console.log('---');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

debugSimon();
