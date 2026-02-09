import api from './api';

const gradeScaleService = {
  async getAll(params = {}) {
    const response = await api.get('/grade-scale', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/grade-scale/${id}`);
    return response.data;
  },

  async create(gradeData) {
    const response = await api.post('/grade-scale', gradeData);
    return response.data;
  },

  async update(id, gradeData) {
    const response = await api.put(`/grade-scale/${id}`, gradeData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/grade-scale/${id}`);
    return response.data;
  }
};

export default gradeScaleService;
