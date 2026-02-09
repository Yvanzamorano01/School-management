import api from './api';

const materialsService = {
  async getAll(params = {}) {
    const response = await api.get('/materials', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  async create(formData) {
    const response = await api.post('/materials', formData);
    return response.data;
  },

  async update(id, materialData) {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  },

  async download(id) {
    const response = await api.get(`/materials/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default materialsService;
