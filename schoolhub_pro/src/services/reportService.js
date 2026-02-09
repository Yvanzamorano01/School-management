import api from './api';

// No /reports backend route exists yet - aggregate from existing data
const reportService = {
  async getAll(params = {}) {
    try {
      const [examsRes, attendanceRes, paymentsRes] = await Promise.allSettled([
        api.get('/exams'),
        api.get('/attendance'),
        api.get('/payments')
      ]);

      const exams = examsRes.status === 'fulfilled' ? examsRes.value.data : [];
      const attendance = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : [];
      const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data : [];

      const reports = [];

      if (Array.isArray(exams) && exams.length > 0) {
        reports.push({
          id: 'exam-report',
          title: 'Exam Results Report',
          type: 'Academic',
          status: 'Available',
          generatedAt: new Date().toISOString(),
          description: `Report covering ${exams.length} exams`
        });
      }

      if (Array.isArray(attendance) && attendance.length > 0) {
        reports.push({
          id: 'attendance-report',
          title: 'Attendance Report',
          type: 'Attendance',
          status: 'Available',
          generatedAt: new Date().toISOString(),
          description: `Report covering ${attendance.length} attendance records`
        });
      }

      if (Array.isArray(payments) && payments.length > 0) {
        reports.push({
          id: 'financial-report',
          title: 'Financial Report',
          type: 'Finance',
          status: 'Available',
          generatedAt: new Date().toISOString(),
          description: `Report covering ${payments.length} payment transactions`
        });
      }

      return reports;
    } catch {
      return [];
    }
  },

  async getById(id) {
    return { id, title: 'Report', status: 'Available' };
  },

  async generateReport(reportData) {
    return { success: true, message: 'Report generation not yet implemented' };
  },

  async downloadReport(id) {
    return null;
  }
};

export default reportService;
