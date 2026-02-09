import api from './api';

const semesterService = {
  async getAll(params = {}) {
    const response = await api.get('/semesters', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/semesters/${id}`);
    return response.data;
  },

  async create(semesterData) {
    const response = await api.post('/semesters', semesterData);
    return response.data;
  },

  async update(id, semesterData) {
    const response = await api.put(`/semesters/${id}`, semesterData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/semesters/${id}`);
    return response.data;
  }
};

export default semesterService;
