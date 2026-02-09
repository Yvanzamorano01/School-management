import api from './api';

const sectionService = {
  async getAll(params = {}) {
    const response = await api.get('/sections', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  },

  async create(sectionData) {
    const response = await api.post('/sections', sectionData);
    return response.data;
  },

  async update(id, sectionData) {
    const response = await api.put(`/sections/${id}`, sectionData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  },

  async getByClass(classId) {
    const response = await api.get(`/sections/class/${classId}`);
    return response.data;
  },

  async getStudents(sectionId) {
    const response = await api.get(`/sections/${sectionId}/students`);
    return response.data;
  }
};

export default sectionService;
