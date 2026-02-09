import api from './api';

const timetableService = {
  async getAll(params = {}) {
    const response = await api.get('/timetables', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/timetables/${id}`);
    return response.data;
  },

  async getByClass(classId) {
    const response = await api.get('/timetables', { params: { classId, limit: 1000 } });
    return response.data;
  },

  async create(data) {
    const response = await api.post('/timetables', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/timetables/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/timetables/${id}`);
    return response.data;
  },

  async deleteByClass(classId) {
    const response = await api.delete(`/timetables/class/${classId}`);
    return response.data;
  }
};

export default timetableService;
