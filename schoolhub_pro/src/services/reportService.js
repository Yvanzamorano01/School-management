import api from './api';

const L = { params: { limit: 1000 } };

const reportService = {
  async getAll() {
    // Check what data is available to determine which reports can be generated
    const [examsRes, attendanceRes, paymentsRes, studentsRes] = await Promise.allSettled([
      api.get('/exams', L),
      api.get('/attendance', L),
      api.get('/payments', L),
      api.get('/students', L)
    ]);

    const exams = examsRes.status === 'fulfilled' && Array.isArray(examsRes.value.data) ? examsRes.value.data : [];
    const attendance = attendanceRes.status === 'fulfilled' && Array.isArray(attendanceRes.value.data) ? attendanceRes.value.data : [];
    const payments = paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : [];
    const students = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value.data) ? studentsRes.value.data : [];

    const reports = [];

    reports.push({
      id: 'exam-results',
      name: 'Exam Results Report',
      category: 'academic',
      icon: 'BookOpen',
      description: `Detailed exam results across ${exams.length} exams. Includes scores, grades, and pass rates.`,
      parameters: ['Date Range', 'Class', 'Format'],
      lastGenerated: 'Available'
    });

    reports.push({
      id: 'student-list',
      name: 'Student Enrollment Report',
      category: 'administrative',
      icon: 'Users',
      description: `Complete list of ${students.length} enrolled students with class, section, and contact info.`,
      parameters: ['Class', 'Format'],
      lastGenerated: 'Available'
    });

    reports.push({
      id: 'attendance-report',
      name: 'Attendance Report',
      category: 'academic',
      icon: 'ClipboardCheck',
      description: `Attendance summary from ${attendance.length} records. Shows present, absent, and late counts.`,
      parameters: ['Date Range', 'Class', 'Format'],
      lastGenerated: 'Available'
    });

    reports.push({
      id: 'financial-report',
      name: 'Financial Collections Report',
      category: 'financial',
      icon: 'DollarSign',
      description: `Payment transactions report covering ${payments.length} payments. Revenue breakdown by period.`,
      parameters: ['Date Range', 'Format'],
      lastGenerated: 'Available'
    });

    reports.push({
      id: 'fee-status',
      name: 'Fee Status Report',
      category: 'financial',
      icon: 'Receipt',
      description: 'Outstanding fees and payment status per student. Identifies overdue accounts.',
      parameters: ['Class', 'Format'],
      lastGenerated: 'Available'
    });

    reports.push({
      id: 'class-performance',
      name: 'Class Performance Summary',
      category: 'academic',
      icon: 'BarChart3',
      description: 'Average scores and grade distribution per class. Compare performance across classes.',
      parameters: ['Date Range', 'Class', 'Format'],
      lastGenerated: 'Available'
    });

    return reports;
  },

  async generateReport({ reportId, dateFrom, dateTo, format }) {
    // Fetch relevant data based on report type
    let csvRows = [];
    let headers = [];
    let filename = reportId;

    if (reportId === 'exam-results') {
      const [examsRes, resultsRes] = await Promise.allSettled([
        api.get('/exams', L),
        api.get('/exam-results', L)
      ]);
      const exams = examsRes.status === 'fulfilled' && Array.isArray(examsRes.value.data) ? examsRes.value.data : [];
      const results = resultsRes.status === 'fulfilled' && Array.isArray(resultsRes.value.data) ? resultsRes.value.data : [];

      headers = ['Student', 'Exam', 'Subject', 'Marks', 'Total', 'Percentage', 'Grade', 'Passed'];
      csvRows = results.map(r => [
        r.studentId?.name || 'N/A',
        exams.find(e => (e._id || e.id) === (r.examId?._id || r.examId))?.name || 'N/A',
        r.subjectId?.name || 'N/A',
        r.marks ?? 0,
        r.totalMarks ?? 0,
        r.percentage != null ? `${r.percentage}%` : 'N/A',
        r.grade || 'N/A',
        r.isPassed ? 'Yes' : 'No'
      ]);
      filename = 'exam-results';

    } else if (reportId === 'student-list') {
      const res = await api.get('/students', L);
      const students = Array.isArray(res.data) ? res.data : [];

      headers = ['Name', 'Student ID', 'Class', 'Section', 'Gender', 'Status', 'Email'];
      csvRows = students.map(s => [
        s.name || 'N/A',
        s.studentId || 'N/A',
        s.classId?.name || 'N/A',
        s.sectionId?.name || 'N/A',
        s.gender || 'N/A',
        s.status || 'active',
        s.email || ''
      ]);
      filename = 'student-enrollment';

    } else if (reportId === 'attendance-report') {
      const res = await api.get('/attendance', L);
      const attendance = Array.isArray(res.data) ? res.data : [];

      headers = ['Date', 'Class', 'Total Students', 'Present', 'Absent', 'Late', 'Rate'];
      csvRows = attendance.map(a => {
        const records = a.records || [];
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;
        const total = records.length;
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        return [
          a.date ? new Date(a.date).toLocaleDateString() : 'N/A',
          a.classId?.name || 'N/A',
          total,
          present,
          absent,
          late,
          `${rate}%`
        ];
      });
      filename = 'attendance';

    } else if (reportId === 'financial-report') {
      const res = await api.get('/payments', L);
      const payments = Array.isArray(res.data) ? res.data : [];

      headers = ['Date', 'Receipt', 'Student', 'Amount', 'Method', 'Status'];
      csvRows = payments
        .filter(p => {
          if (!dateFrom && !dateTo) return true;
          const d = new Date(p.paymentDate || p.createdAt);
          if (dateFrom && d < new Date(dateFrom)) return false;
          if (dateTo && d > new Date(dateTo)) return false;
          return true;
        })
        .map(p => [
          p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A',
          p.receiptNumber || '',
          p.studentId?.name || 'N/A',
          p.amount || 0,
          p.paymentMethod || 'Cash',
          'Completed'
        ]);
      filename = 'financial-collections';

    } else if (reportId === 'fee-status') {
      const res = await api.get('/student-fees', L);
      const fees = Array.isArray(res.data) ? res.data : [];

      headers = ['Student', 'Fee Type', 'Total Amount', 'Paid', 'Balance', 'Status'];
      csvRows = fees.map(f => [
        f.studentId?.name || 'N/A',
        f.feeTypeId?.name || 'N/A',
        f.totalAmount || 0,
        f.paidAmount || 0,
        f.balance || 0,
        f.status || 'pending'
      ]);
      filename = 'fee-status';

    } else if (reportId === 'class-performance') {
      const [examsRes, resultsRes] = await Promise.allSettled([
        api.get('/exams', L),
        api.get('/exam-results', L)
      ]);
      const results = resultsRes.status === 'fulfilled' && Array.isArray(resultsRes.value.data) ? resultsRes.value.data : [];

      // Group by subject
      const bySubject = {};
      results.forEach(r => {
        const subj = r.subjectId?.name || 'Unknown';
        if (!bySubject[subj]) bySubject[subj] = { total: 0, sum: 0, passed: 0, count: 0 };
        bySubject[subj].sum += (r.percentage || 0);
        bySubject[subj].passed += r.isPassed ? 1 : 0;
        bySubject[subj].count++;
      });

      headers = ['Subject', 'Students', 'Average %', 'Pass Rate'];
      csvRows = Object.entries(bySubject).map(([subj, d]) => [
        subj,
        d.count,
        d.count > 0 ? `${Math.round(d.sum / d.count)}%` : '0%',
        d.count > 0 ? `${Math.round((d.passed / d.count) * 100)}%` : '0%'
      ]);
      filename = 'class-performance';
    }

    // Generate CSV
    const csvContent = [headers.join(','), ...csvRows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  }
};

export default reportService;
