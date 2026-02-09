import api from './api';

const classService = {
  async getAll(params = {}) {
    const response = await api.get('/classes', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  async create(classData) {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  async update(id, classData) {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  async getSections(classId) {
    const response = await api.get(`/classes/${classId}/sections`);
    return response.data;
  },

  async getAllSections() {
    const response = await api.get('/sections');
    return response.data;
  }
};

export default classService;
