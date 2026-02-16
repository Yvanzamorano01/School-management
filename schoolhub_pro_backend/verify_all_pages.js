/**
 * Comprehensive verification of Academic Years, Semesters, Exams, and Report Cards.
 * Tests both API correctness and logical relationships between modules.
 */

const BASE = 'http://localhost:5000/api';

async function req(path, token, method = 'GET', body = null) {
    const opts = {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    return res.json();
}

async function run() {
    const results = { passed: 0, failed: 0, tests: [] };

    function test(name, condition, detail = '') {
        if (condition) {
            results.passed++;
            results.tests.push(`  ✅ ${name}`);
        } else {
            results.failed++;
            results.tests.push(`  ❌ ${name}${detail ? ' — ' + detail : ''}`);
        }
    }

    // ─── LOGIN ───
    console.log('\n🔐 Authenticating...');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@schoolhub.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;
    test('Login succeeds', !!token);
    if (!token) { console.log('Cannot proceed without token.'); return; }

    // ═══════════════════════════════════════════
    // 1. ACADEMIC YEARS
    // ═══════════════════════════════════════════
    console.log('\n📅 === ACADEMIC YEARS ===');
    const yearsRes = await req('/academic-years', token);
    const years = yearsRes.data || yearsRes.docs || [];
    test('Academic Years endpoint returns data', years.length > 0, `Got ${years.length}`);

    const activeYear = years.find(y => y.status === 'active');
    test('There is an active academic year', !!activeYear, activeYear ? activeYear.name : 'None found');

    if (activeYear) {
        test('Active year has name', !!activeYear.name);
        test('Active year has startDate', !!activeYear.startDate);
        test('Active year has endDate', !!activeYear.endDate);
        test('endDate > startDate', new Date(activeYear.endDate) > new Date(activeYear.startDate));
    }

    // ═══════════════════════════════════════════
    // 2. SEMESTERS
    // ═══════════════════════════════════════════
    console.log('\n⏳ === SEMESTERS ===');
    const semRes = await req('/semesters', token);
    const semesters = semRes.data || semRes.docs || [];
    test('Semesters endpoint returns data', semesters.length > 0, `Got ${semesters.length}`);

    for (const sem of semesters) {
        test(`Semester "${sem.name}" has valid dates`, new Date(sem.endDate) > new Date(sem.startDate));
        test(`Semester "${sem.name}" has status`, ['active', 'inactive', 'upcoming', 'completed'].includes(sem.status));

        if (activeYear && sem.academicYearId) {
            const yearId = typeof sem.academicYearId === 'object' ? sem.academicYearId._id : sem.academicYearId;
            test(`Semester "${sem.name}" belongs to a valid academic year`, !!yearId);
        }
    }

    const activeSem = semesters.find(s => s.status === 'active');
    if (activeSem) {
        console.log(`  📌 Active semester: ${activeSem.name}`);
    }

    // ═══════════════════════════════════════════
    // 3. EXAMS
    // ═══════════════════════════════════════════
    console.log('\n📝 === EXAMS ===');
    const examsRes = await req('/exams', token);
    const exams = examsRes.data || examsRes.docs || [];
    test('Exams endpoint returns data', exams.length > 0, `Got ${exams.length}`);

    // Check exam structure
    if (exams.length > 0) {
        const sample = exams[0];
        test('Exam has title', !!sample.title);
        test('Exam has totalMarks', typeof sample.totalMarks === 'number' && sample.totalMarks > 0);
        test('Exam has status', ['scheduled', 'ongoing', 'completed', 'cancelled'].includes(sample.status));
        test('Exam has classId', !!sample.classId);

        // Count by status
        const statusCounts = {};
        exams.forEach(e => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });
        console.log('  📊 Exam status distribution:', JSON.stringify(statusCounts));

        const completedExams = exams.filter(e => e.status === 'completed');
        test('At least one completed exam exists', completedExams.length > 0, `${completedExams.length} completed`);

        // Check that completed exams have results
        if (completedExams.length > 0) {
            const examId = completedExams[0]._id;
            const resultsRes = await req(`/exams/${examId}/results`, token);
            const examResults = resultsRes.data || resultsRes.docs || resultsRes.results || [];
            test('Completed exam has results', examResults.length > 0, `Exam "${completedExams[0].title}" has ${examResults.length} results`);

            if (examResults.length > 0) {
                const r = examResults[0];
                test('Result has marksObtained', typeof r.marksObtained === 'number');
                test('Result has percentage', typeof r.percentage === 'number');
                test('Result has grade', !!r.grade);
                test('marksObtained <= totalMarks', r.marksObtained <= completedExams[0].totalMarks);
            }
        }
    }

    // ═══════════════════════════════════════════
    // 4. REPORT CARDS
    // ═══════════════════════════════════════════
    console.log('\n📊 === REPORT CARDS ===');

    // Get classes and find one with students
    const classesRes = await req('/classes', token);
    const classes = classesRes.data || classesRes.docs || [];
    test('Classes endpoint returns data', classes.length > 0);

    // Find a student + semester combo with completed exams
    let reportCardTested = false;
    const firstSem = semesters[0];

    if (firstSem && classes.length > 0) {
        // Find a class with completed exams in this semester
        for (const cls of classes.slice(0, 3)) {
            const studRes = await req(`/students?classId=${cls._id}&limit=1`, token);
            const students = studRes.docs || studRes.data || [];
            if (students.length === 0) continue;

            const student = students[0];
            console.log(`  🎓 Testing report card: ${student.name} | ${cls.name} | ${firstSem.name}`);

            // Individual report card
            const rcRes = await req(`/report-cards/student/${student._id}?semesterId=${firstSem._id}`, token);
            test('Report card endpoint returns success', rcRes.success === true);

            if (rcRes.data) {
                const rc = rcRes.data;

                // Student info
                test('RC has student info', !!rc.student?.name);
                test('RC student name matches', rc.student.name === student.name);
                test('RC has studentId', !!rc.student?.studentId);
                test('RC has class', !!rc.student?.class);

                // Semester info
                test('RC has semester info', !!rc.semester?.name);
                test('RC semester name matches', rc.semester.name === firstSem.name);

                // Subjects
                test('RC has subjects array', Array.isArray(rc.subjects));
                if (rc.subjects.length > 0) {
                    const subj = rc.subjects[0];
                    test('Subject has name', !!subj.subject);
                    test('Subject has marks', typeof subj.totalMarks === 'number');
                    test('Subject has percentage', typeof subj.percentage === 'number');
                    test('Subject has grade', !!subj.grade);
                    test('Subject percentage is 0-100', subj.percentage >= 0 && subj.percentage <= 100);
                }

                // Summary
                test('RC has summary', !!rc.summary);
                test('Summary has totalMarks', typeof rc.summary?.totalMarks === 'number');
                test('Summary has percentage', typeof rc.summary?.percentage === 'number');
                test('Summary has grade', !!rc.summary?.grade);
                test('Summary has rank', typeof rc.summary?.rank === 'number');
                test('Summary has totalStudents', typeof rc.summary?.totalStudents === 'number');
                test('Summary has passed boolean', typeof rc.summary?.passed === 'boolean');

                // Attendance
                test('RC has attendance', !!rc.attendance);
                test('Attendance has present count', typeof rc.attendance?.present === 'number');
                test('Attendance has absent count', typeof rc.attendance?.absent === 'number');
                test('Attendance has rate', typeof rc.attendance?.rate === 'number');

                // Logical checks
                if (rc.subjects.length > 0) {
                    const calcTotal = rc.subjects.reduce((s, sub) => s + sub.totalMarks, 0);
                    test('Summary totalMarks matches subjects sum', rc.summary.totalMarks === calcTotal,
                        `summary=${rc.summary.totalMarks}, calc=${calcTotal}`);
                    test('Rank is within range', rc.summary.rank >= 1 && rc.summary.rank <= rc.summary.totalStudents);
                }

                reportCardTested = true;

                // Class report cards
                console.log(`\n  📋 Testing class report cards for ${cls.name}...`);
                const classRcRes = await req(`/report-cards/class/${cls._id}?semesterId=${firstSem._id}`, token);
                test('Class report cards returns success', classRcRes.success === true);
                test('Class report cards has data array', Array.isArray(classRcRes.data));
                test('Class report cards has meta', !!classRcRes.meta);

                if (classRcRes.data?.length > 0) {
                    const first = classRcRes.data[0];
                    test('Class RC entry has name', !!first.name);
                    test('Class RC entry has rank', first.rank !== undefined);
                    test('Class RC entry has passed boolean', typeof first.passed === 'boolean');
                    // Check sorting (by rank)
                    if (classRcRes.data.length > 1) {
                        const ranks = classRcRes.data.filter(d => typeof d.rank === 'number').map(d => d.rank);
                        const isSorted = ranks.every((r, i) => i === 0 || r >= ranks[i - 1]);
                        test('Class RC is sorted by rank', isSorted);
                    }
                }

                break; // Only test one class
            }
        }
    }

    if (!reportCardTested) {
        console.log('  ⚠️  No student+semester combo with data found for report card testing.');
    }

    // ═══════════════════════════════════════════
    // 5. CROSS-MODULE LOGIC
    // ═══════════════════════════════════════════
    console.log('\n🔗 === CROSS-MODULE LOGICAL CHECKS ===');

    // Semesters belong to academic years
    if (semesters.length > 0 && years.length > 0) {
        const yearIds = years.map(y => y._id);
        const validLinks = semesters.every(s => {
            const yid = typeof s.academicYearId === 'object' ? s.academicYearId?._id : s.academicYearId;
            return !yid || yearIds.includes(yid);
        });
        test('All semesters link to valid academic years', validLinks);
    }

    // Exams belong to valid semesters
    if (exams.length > 0 && semesters.length > 0) {
        const semIds = semesters.map(s => s._id);
        let validExamLinks = 0;
        for (const e of exams.slice(0, 5)) {
            const semId = typeof e.semesterId === 'object' ? e.semesterId?._id : e.semesterId;
            if (semId && semIds.includes(semId)) validExamLinks++;
        }
        test('Exams link to valid semesters', validExamLinks > 0, `${validExamLinks}/${Math.min(exams.length, 5)} checked`);
    }

    // ═══════════════════════════════════════════
    // RESULTS
    // ═══════════════════════════════════════════
    console.log('\n' + '═'.repeat(50));
    console.log(`📊 RESULTS: ${results.passed} passed, ${results.failed} failed`);
    console.log('═'.repeat(50));
    results.tests.forEach(t => console.log(t));
    console.log('═'.repeat(50));
}

run().catch(e => console.error('Fatal error:', e.message));
