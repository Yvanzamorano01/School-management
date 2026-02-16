import api from './api';

const studentService = {
  async getAll(params = {}) {
    const response = await api.get('/students', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async create(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async update(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  async getStudentById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async getStudentResults(id) {
    const response = await api.get(`/students/${id}/results`);
    const data = response.data;
    // Backend returns { results: [...], rank, totalStudents } after interceptor unwrap
    if (data?.results && Array.isArray(data.results)) return data.results;
    return Array.isArray(data) ? data : (data?.data || []);
  },

  async getStudentAttendance(id) {
    const response = await api.get(`/students/${id}/attendance`);
    return response.data;
  },

  async getStudentFees(id) {
    const response = await api.get(`/students/${id}/fees`);
    const data = response.data;
    // Backend returns { fees: [...], summary: {...} } — return full object for ViewStudentModal
    if (data?.fees && data?.summary) return data;
    return Array.isArray(data) ? { fees: data, summary: null } : (data || { fees: [], summary: null });
  },

  async getStudentAcademics(id) {
    const response = await api.get(`/students/${id}/results`);
    return response.data;
  },

  async getStudentCommunications(id) {
    const response = await api.get(`/notices`, { params: { target: 'Students' } });
    return response.data;
  },

  async bulkUpdateStatus(studentIds, status) {
    const response = await api.patch('/students/bulk-status', { studentIds, status });
    return response.data;
  },

  async exportStudents(studentIds) {
    const response = await api.post('/students/export', { studentIds }, {
      responseType: 'blob'
    });
    return response.data;
  },

  async promoteStudents(studentIds, classId, sectionId, remarks) {
    const response = await api.post('/students/promote', { studentIds, classId, sectionId, remarks });
    return response.data;
  },

  async getStudentHistory(id) {
    const response = await api.get(`/students/${id}/history`);
    // Interceptor already unwraps response.data → data. Don't double-unwrap.
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data || []);
  }
};

export default studentService;
