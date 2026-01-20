import axiosClient from '../utils/axiosClient';

const moduleProgressService = {
  getModuleProgress: (enrollmentId, moduleId) => axiosClient.get(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}`),
  getModuleProgressByModuleId: (moduleId) => axiosClient.get(`/module-progress/modules/${moduleId}`),
  updateModuleProgress: (enrollmentId, moduleId, progressData) => axiosClient.put(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}`, progressData),
  trackContentProgress: (enrollmentId, moduleId, contentProgressData) => axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/track`, contentProgressData),
  markModuleComplete: (enrollmentId, moduleId, completionData = {}) => axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/complete`, completionData),
  getProgressSummary: (enrollmentId) => axiosClient.get(`/module-progress/enrollments/${enrollmentId}/summary`),
  getUserProgressOverview: () => axiosClient.get('/module-progress/overview'),
  getBookmarkedModules: (queryParams = {}) => axiosClient.get('/module-progress/bookmarks', { params: queryParams }),
  bookmarkModule: (enrollmentId, moduleId) => axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/bookmark`),
  removeBookmark: (enrollmentId, moduleId) => axiosClient.delete(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/bookmark`)
};

export default moduleProgressService;
