import api from './api';

const parentService = {
  async getAll(params = {}) {
    const response = await api.get('/parents', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/parents/${id}`);
    return response.data;
  },

  async create(parentData) {
    const response = await api.post('/parents', parentData);
    return response.data;
  },

  async update(id, parentData) {
    const response = await api.put(`/parents/${id}`, parentData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },

  async getChildren(parentId) {
    const response = await api.get(`/parents/${parentId}/children`);
    return response.data;
  }
};

export default parentService;
