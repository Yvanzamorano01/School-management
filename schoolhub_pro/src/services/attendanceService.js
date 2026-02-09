import api from './api';

const attendanceService = {
  async getAll(params = {}) {
    const response = await api.get('/attendance', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  async create(attendanceData) {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  async update(id, attendanceData) {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  async getByClass(classId, date) {
    const response = await api.get(`/attendance/class/${classId}`, { params: { date } });
    return response.data;
  },

  async getByStudent(studentId, params = {}) {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },

  async markBulk(attendanceRecords) {
    const response = await api.post('/attendance/bulk', { records: attendanceRecords });
    return response.data;
  }
};

export default attendanceService;
