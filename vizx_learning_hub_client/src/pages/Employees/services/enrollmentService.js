import axiosClient from '../../../utils/axiosClient';

const enrollmentService = {
    enrollInPath: (learningPathId) => {
        return axiosClient.post('/enrollments', { learningPathId });
    },

    getMyEnrollments: (queryParams = {}) => {
        return axiosClient.get('/enrollments', { params: queryParams });
    },

    getActiveEnrollmentsCount: () => {
        return axiosClient.get('/enrollments/active-count');
    },

    getEnrollment: (enrollmentId) => {
        return axiosClient.get(`/enrollments/${enrollmentId}`);
    },

    updateEnrollment: (enrollmentId, updateData) => {
        return axiosClient.put(`/enrollments/${enrollmentId}`, updateData);
    },

    dropEnrollment: (enrollmentId) => {
        return axiosClient.delete(`/enrollments/${enrollmentId}/drop`);
    },

    getEnrollmentProgress: (enrollmentId) => {
        return axiosClient.get(`/enrollments/${enrollmentId}/progress`);
    }
};

export default enrollmentService;
