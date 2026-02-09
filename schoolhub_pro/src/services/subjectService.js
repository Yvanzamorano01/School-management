import api from './api';

const subjectService = {
  async getAll(params = {}) {
    const response = await api.get('/subjects', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  async create(subjectData) {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  async update(id, subjectData) {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  async getByClass(classId) {
    const response = await api.get(`/subjects/class/${classId}`);
    return response.data;
  }
};

export default subjectService;
