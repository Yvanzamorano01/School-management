import api from './api';

const paymentService = {
  async getAll(params = {}) {
    const response = await api.get('/payments', { params: { limit: 1000, ...params } });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async create(paymentData) {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  async getByStudent(studentId) {
    const response = await api.get(`/payments/student/${studentId}`);
    return response.data;
  },

  async getStudentFees(params = {}) {
    const response = await api.get('/student-fees', { params: { limit: 1000, ...params } });
    return response.data;
  }
};

export default paymentService;
