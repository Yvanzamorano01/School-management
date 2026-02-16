const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./src/models/Student');
const StudentHistory = require('./src/models/StudentHistory');
const AcademicYear = require('./src/models/AcademicYear');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
};

const injectHistory = async () => {
    try {
        await connectDB();

        // Get an active or completed year
        const year = await AcademicYear.findOne().sort({ createdAt: -1 });
        if (!year) throw new Error('No academic year found');

        // Names to target
        const names = ["Amadou Diallo", "Simon Ghost"];

        for (const name of names) {
            const students = await Student.find({ name: new RegExp(name, 'i') });
            console.log(`Found ${students.length} students matching "${name}"`);

            for (const s of students) {
                // Check if history exists
                const exists = await StudentHistory.findOne({ studentId: s._id });
                if (!exists) {
                    console.log(`Injecting history for ${s.name} (${s._id})...`);
                    await StudentHistory.create({
                        studentId: s._id,
                        academicYearId: year._id,
                        classId: s.classId,
                        sectionId: s.sectionId,
                        status: 'Promoted',
                        remarks: 'Injected History Record',
                        promotionDate: new Date()
                    });
                    console.log('  Done.');
                } else {
                    console.log(`  ${s.name} (${s._id}) already has history.`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

injectHistory();
