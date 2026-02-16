import api from './api';

const resultsService = {
  async getStudentResults(semesterId = null, academicYearId = null) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user.profileId;
      if (!studentId) return { results: [], rank: null, totalStudents: null };

      const params = {};
      if (academicYearId) params.academicYearId = academicYearId;

      const response = await api.get(`/students/${studentId}/results`, { params });
      const data = response.data || {};

      // Handle new response format: { results: [...], rank, totalStudents }
      let results = [];
      let rank = null;
      let totalStudents = null;

      if (data.results && Array.isArray(data.results)) {
        results = data.results;
        rank = data.rank;
        totalStudents = data.totalStudents;
      } else if (Array.isArray(data)) {
        results = data;
      }

      if (semesterId && semesterId !== 'all') {
        results = results.filter(r => {
          const examSemId = r.examId?.semesterId?._id || r.examId?.semesterId;
          return examSemId === semesterId || String(examSemId) === String(semesterId);
        });
      }
      return { results, rank, totalStudents };
    } catch {
      return { results: [], rank: null, totalStudents: null };
    }
  },

  async getResultsBySemester(semesterId) {
    try {
      const response = await api.get('/exams', { params: { semesterId } });
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  async getResultsBySubject(subjectId) {
    try {
      const response = await api.get('/exams', { params: { subjectId } });
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  async getPerformanceStats(semesterId = null) {
    try {
      const data = await this.getStudentResults(semesterId);
      const results = data.results || [];
      if (results.length === 0) return {};
      const avg = Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length);
      const passed = results.filter(r => r.isPassed).length;
      return {
        averageScore: avg,
        totalExams: results.length,
        passed,
        failed: results.length - passed,
        highestScore: Math.max(...results.map(r => r.percentage || 0)),
        lowestScore: Math.min(...results.map(r => r.percentage || 0))
      };
    } catch {
      return {};
    }
  },

  async getPerformanceAnalytics(semesterId = null) {
    try {
      const data = await this.getStudentResults(semesterId);
      return { results: data.results || [] };
    } catch {
      return {};
    }
  },

  async getSemesters() {
    const response = await api.get('/semesters');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getSubjects() {
    const response = await api.get('/subjects');
    return Array.isArray(response.data) ? response.data : [];
  },

  async exportResults(semesterId) {
    return null;
  }
};

export default resultsService;
