import api from './api';

const adminService = {
  async getAll(params = {}) {
    const response = await api.get('/admins', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  async create(adminData) {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  async update(id, adminData) {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/admins/${id}`);
    return response.data;
  }
};

export default adminService;
