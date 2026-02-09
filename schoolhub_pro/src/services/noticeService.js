import api from './api';

const noticeService = {
  async getAll(params = {}) {
    const response = await api.get('/notices', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  async create(noticeData) {
    const response = await api.post('/notices', noticeData);
    return response.data;
  },

  async update(id, noticeData) {
    const response = await api.put(`/notices/${id}`, noticeData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  }
};

export default noticeService;
