import axiosClient from '../utils/axiosClient';

const learningPathService = {
  getAllLearningPaths: (queryParams = {}) => axiosClient.get('/learning-paths', { params: queryParams }),
  getLearningPathById: (id) => axiosClient.get(`/learning-paths/${id}`),
  getLearningPathBySlug: (slug) => axiosClient.get(`/learning-paths/slug/${slug}`),
  getFeaturedLearningPaths: (queryParams = {}) => axiosClient.get('/learning-paths/featured', { params: queryParams }),
  getLearningPathsByCategory: (category, queryParams = {}) => axiosClient.get(`/learning-paths/category/${category}`, { params: queryParams }),
  createLearningPath: (data) => axiosClient.post('/learning-paths', data),
  updateLearningPath: (id, data) => axiosClient.put(`/learning-paths/${id}`, data),
  deleteLearningPath: (id) => axiosClient.delete(`/learning-paths/${id}`),
  publishLearningPath: (id) => axiosClient.patch(`/learning-paths/${id}/publish`),
  archiveLearningPath: (id) => axiosClient.patch(`/learning-paths/${id}/archive`)
};

export default learningPathService;