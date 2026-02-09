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
    // Handle both wrapped {data: [...]} and direct array responses
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data || data || []);
  },

  async getStudentAttendance(id) {
    const response = await api.get(`/students/${id}/attendance`);
    return response.data;
  },

  async getStudentFees(id) {
    const response = await api.get(`/students/${id}/fees`);
    // Backend returns { fees: [...], summary: {...} }, extract fees array
    const data = response.data;
    return Array.isArray(data) ? data : (data?.fees || data?.data || []);
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
  }
};

export default studentService;
