import api from './api';

const academicYearService = {
  async getAll(params = {}) {
    const response = await api.get('/academic-years', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/academic-years/${id}`);
    return response.data;
  },

  async create(yearData) {
    const response = await api.post('/academic-years', yearData);
    return response.data;
  },

  async update(id, yearData) {
    const response = await api.put(`/academic-years/${id}`, yearData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/academic-years/${id}`);
    return response.data;
  },

  async getActive() {
    const response = await api.get('/academic-years/active');
    return response.data;
  }
};

export default academicYearService;
