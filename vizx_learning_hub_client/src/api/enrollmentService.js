import axiosClient from '../utils/axiosClient';

const enrollmentService = {
  enrollInPath: (learningPathId) => axiosClient.post('/enrollments', { learningPathId }),
  getMyEnrollments: (queryParams = {}) => axiosClient.get('/enrollments', { params: queryParams }),
  getActiveEnrollmentsCount: () => axiosClient.get('/enrollments/active-count'),
  getEnrollment: (enrollmentId) => axiosClient.get(`/enrollments/${enrollmentId}`),
  updateEnrollment: (enrollmentId, updateData) => axiosClient.put(`/enrollments/${enrollmentId}`, updateData),
  dropEnrollment: (enrollmentId) => axiosClient.delete(`/enrollments/${enrollmentId}/drop`),
  getEnrollmentProgress: (enrollmentId) => axiosClient.get(`/enrollments/${enrollmentId}/progress`)
};

export default enrollmentService;
