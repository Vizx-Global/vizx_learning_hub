import axiosClient from '../../../utils/axiosClient';

const learningPathService = {
  // Get all learning paths (protected)
  getAllLearningPaths: (queryParams = {}) => {
    return axiosClient.get('/learning-paths', { params: queryParams });
  },

  // Get learning path by ID (protected)
  getLearningPathById: (id) => {
    return axiosClient.get(`/learning-paths/${id}`);
  },

  // Get learning path by slug (public)
  getLearningPathBySlug: (slug) => {
    return axiosClient.get(`/learning-paths/slug/${slug}`);
  },

  // Get featured learning paths (public)
  getFeaturedLearningPaths: (queryParams = {}) => {
    return axiosClient.get('/learning-paths/featured', { params: queryParams });
  },

  // Get learning paths by category (public)
  getLearningPathsByCategory: (category, queryParams = {}) => {
    return axiosClient.get(`/learning-paths/category/${category}`, { 
      params: queryParams 
    });
  }
};

export default learningPathService;