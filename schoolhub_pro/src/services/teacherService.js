import api from './api';

const teacherService = {
  async getAll(params = {}) {
    const response = await api.get('/teachers', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  async create(teacherData) {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  async update(id, teacherData) {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  async getSubjects() {
    const response = await api.get('/teachers/subjects');
    return response.data;
  }
};

export default teacherService;
