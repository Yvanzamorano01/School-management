import api from './api';

const feeTypeService = {
  async getAll(params = {}) {
    const response = await api.get('/fee-types', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/fee-types/${id}`);
    return response.data;
  },

  async create(feeTypeData) {
    const response = await api.post('/fee-types', feeTypeData);
    return response.data;
  },

  async update(id, feeTypeData) {
    const response = await api.put(`/fee-types/${id}`, feeTypeData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/fee-types/${id}`);
    return response.data;
  }
};

export default feeTypeService;
