const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const GradeScale = require('../models/GradeScale');
const Attendance = require('../models/Attendance');
const Semester = require('../models/Semester');
const User = require('../models/User');
const Parent = require('../models/Parent');

/**
 * Generate a report card for a single student
 * GET /api/report-cards/student/:studentId?semesterId=xxx
 */
exports.getStudentReportCard = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { semesterId } = req.query;

        if (!semesterId) {
            return res.status(400).json({ success: false, message: 'semesterId is required' });
        }

        // Access control: students can only view their own, parents only their children
        const userRole = req.user.role;
        if (userRole === 'student') {
            const user = await User.findById(req.user._id);
            if (!user || user.profileId.toString() !== studentId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        } else if (userRole === 'parent') {
            const parent = await Parent.findOne({ userId: req.user._id });
            const targetStudent = await Student.findById(studentId);
            if (!parent || !targetStudent || targetStudent.parentId?.toString() !== parent._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        // 1. Student info
        const student = await Student.findById(studentId)
            .populate('classId', 'name code')
            .populate('sectionId', 'name room');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // 2. Semester info
        const semester = await Semester.findById(semesterId).populate('academicYearId', 'name');
        if (!semester) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        // 3. Exams for student's class + semester
        const exams = await Exam.find({
            classId: student.classId._id,
            semesterId: semesterId,
            status: 'completed'
        }).populate('subjectId', 'name code');

        const examIds = exams.map(e => e._id);

        // 4. Results for this student on those exams
        const results = await ExamResult.find({
            studentId: studentId,
            examId: { $in: examIds }
        }).populate({
            path: 'examId',
            populate: { path: 'subjectId', select: 'name code' }
        });

        // 5. Grade scale
        const gradeScale = await GradeScale.find().sort({ minScore: -1 });

        // 6. Build per-subject breakdown
        const subjectMap = {};
        for (const result of results) {
            const exam = result.examId;
            if (!exam || !exam.subjectId) continue;
            const subjectName = exam.subjectId.name;
            const subjectCode = exam.subjectId.code;

            if (!subjectMap[subjectName]) {
                subjectMap[subjectName] = {
                    subject: subjectName,
                    code: subjectCode,
                    exams: [],
                    totalMarks: 0,
                    totalMaxMarks: 0
                };
            }

            subjectMap[subjectName].exams.push({
                title: exam.title,
                marksObtained: result.marksObtained,
                totalMarks: exam.totalMarks,
                percentage: result.percentage,
                grade: result.grade,
                isPassed: result.isPassed
            });
            subjectMap[subjectName].totalMarks += result.marksObtained;
            subjectMap[subjectName].totalMaxMarks += exam.totalMarks;
        }

        // Compute averages & grades per subject
        const subjects = Object.values(subjectMap).map(s => {
            const percentage = s.totalMaxMarks > 0 ? (s.totalMarks / s.totalMaxMarks) * 100 : 0;
            const matchedGrade = gradeScale.find(g => percentage >= g.minScore && percentage <= g.maxScore);
            return {
                ...s,
                percentage: Math.round(percentage * 100) / 100,
                grade: matchedGrade?.grade || '-',
                gpa: matchedGrade?.gpaPoints || 0,
                appreciation: matchedGrade?.description || ''
            };
        });

        // 7. Overall summary
        const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
        const totalMaxMarks = subjects.reduce((sum, s) => sum + s.totalMaxMarks, 0);
        const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
        const overallGrade = gradeScale.find(g => overallPercentage >= g.minScore && overallPercentage <= g.maxScore);
        const overallGPA = subjects.length > 0
            ? subjects.reduce((sum, s) => sum + s.gpa, 0) / subjects.length
            : 0;

        // 8. Rank in class (compare with all students in the same class for same exams)
        const classStudents = await Student.find({ classId: student.classId._id, status: 'Active' });
        const classStudentIds = classStudents.map(s => s._id);

        const allClassResults = await ExamResult.find({
            studentId: { $in: classStudentIds },
            examId: { $in: examIds }
        });

        // Group results by student and compute total marks
        const studentTotals = {};
        for (const r of allClassResults) {
            const sid = r.studentId.toString();
            if (!studentTotals[sid]) studentTotals[sid] = 0;
            studentTotals[sid] += r.marksObtained;
        }

        // Sort descending and find rank
        const sortedTotals = Object.entries(studentTotals).sort((a, b) => b[1] - a[1]);
        const rank = sortedTotals.findIndex(([sid]) => sid === studentId) + 1;
        const totalStudents = sortedTotals.length;

        // 9. Attendance summary for the semester date range
        let attendanceSummary = { total: 0, present: 0, absent: 0, late: 0, rate: 0 };
        try {
            const attendanceDocs = await Attendance.find({
                classId: student.classId._id,
                date: { $gte: semester.startDate, $lte: semester.endDate }
            });

            let total = 0, present = 0, absent = 0, late = 0;
            for (const doc of attendanceDocs) {
                const record = doc.records.find(r => r.studentId.toString() === studentId);
                if (record) {
                    total++;
                    if (record.status === 'present') present++;
                    else if (record.status === 'absent') absent++;
                    else if (record.status === 'late') late++;
                }
            }
            const rate = total > 0 ? Math.round((present + late) / total * 1000) / 10 : 0;
            attendanceSummary = { total, present, absent, late, rate };
        } catch (err) {
            console.error('Attendance fetch error:', err.message);
        }

        // 10. Calculate pass threshold based on actual exam passingMarks
        const totalPassingMarks = exams.reduce((sum, e) => sum + (e.passingMarks || Math.ceil(e.totalMarks * 0.4)), 0);

        // 11. Build response
        res.json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    studentId: student.studentId,
                    class: student.classId?.name,
                    section: student.sectionId?.name,
                    dateOfBirth: student.dateOfBirth,
                    gender: student.gender
                },
                semester: {
                    name: semester.name,
                    academicYear: semester.academicYearId?.name,
                    startDate: semester.startDate,
                    endDate: semester.endDate
                },
                subjects,
                summary: {
                    totalMarks,
                    totalMaxMarks,
                    percentage: Math.round(overallPercentage * 100) / 100,
                    grade: overallGrade?.grade || '-',
                    gpa: Math.round(overallGPA * 100) / 100,
                    rank,
                    totalStudents,
                    passed: totalMarks >= totalPassingMarks
                },
                attendance: attendanceSummary
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Generate report cards for all students in a class
 * GET /api/report-cards/class/:classId?semesterId=xxx
 */
exports.getClassReportCards = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const { semesterId } = req.query;

        if (!semesterId) {
            return res.status(400).json({ success: false, message: 'semesterId is required' });
        }

        const students = await Student.find({ classId, status: 'Active' }).select('_id name studentId');

        // For the class overview, return a summary per student (not full report cards)
        const exams = await Exam.find({ classId, semesterId, status: 'completed' });
        const examIds = exams.map(e => e._id);
        const totalMaxMarks = exams.reduce((sum, e) => sum + e.totalMarks, 0);

        const allResults = await ExamResult.find({
            studentId: { $in: students.map(s => s._id) },
            examId: { $in: examIds }
        });

        // Group by student
        const studentMap = {};
        for (const r of allResults) {
            const sid = r.studentId.toString();
            if (!studentMap[sid]) studentMap[sid] = { totalMarks: 0, count: 0 };
            studentMap[sid].totalMarks += r.marksObtained;
            studentMap[sid].count++;
        }

        // Sort by total marks for ranking
        const sorted = Object.entries(studentMap).sort((a, b) => b[1].totalMarks - a[1].totalMarks);

        const gradeScale = await GradeScale.find().sort({ minScore: -1 });
        const totalPassingMarks = exams.reduce((sum, e) => sum + (e.passingMarks || Math.ceil(e.totalMarks * 0.4)), 0);

        const summaries = students.map(s => {
            const sid = s._id.toString();
            const data = studentMap[sid] || { totalMarks: 0, count: 0 };
            const percentage = totalMaxMarks > 0 ? (data.totalMarks / totalMaxMarks) * 100 : 0;
            const matchedGrade = gradeScale.find(g => percentage >= g.minScore && percentage <= g.maxScore);
            const rank = sorted.findIndex(([id]) => id === sid) + 1;

            return {
                studentId: s._id,
                name: s.name,
                studentCode: s.studentId,
                totalMarks: data.totalMarks,
                totalMaxMarks,
                percentage: Math.round(percentage * 100) / 100,
                grade: matchedGrade?.grade || '-',
                rank: rank || '-',
                passed: data.totalMarks >= totalPassingMarks
            };
        }).sort((a, b) => (a.rank === '-' ? 999 : a.rank) - (b.rank === '-' ? 999 : b.rank));

        res.json({
            success: true,
            data: summaries,
            meta: {
                classId,
                semesterId,
                totalStudents: students.length,
                totalExams: exams.length
            }
        });
    } catch (err) {
        next(err);
    }
};
