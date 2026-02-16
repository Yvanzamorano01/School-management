import api from './api';

const reportCardService = {
    async getStudentReportCard(studentId, semesterId) {
        const response = await api.get(`/report-cards/student/${studentId}`, {
            params: { semesterId }
        });
        return response.data;
    },

    async getClassReportCards(classId, semesterId) {
        const response = await api.get(`/report-cards/class/${classId}`, {
            params: { semesterId }
        });
        return response.data;
    }
};

export default reportCardService;
