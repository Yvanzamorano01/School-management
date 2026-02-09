import api from './api';

const examService = {
  async getAll(params = {}) {
    const response = await api.get('/exams', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  async create(examData) {
    const response = await api.post('/exams', examData);
    return response.data;
  },

  async update(id, examData) {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  async getResults(examId) {
    const response = await api.get(`/exams/${examId}/results`);
    return response.data;
  },

  async enterMarks(examId, marks) {
    const response = await api.post(`/exams/${examId}/marks`, { marks });
    return response.data;
  }
};

export default examService;
