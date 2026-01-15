import axiosClient from '../../../../utils/axiosClient';

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
  },

  // Create learning path (admin/manager/content creator)
  createLearningPath: (learningPathData) => {
    return axiosClient.post('/learning-paths', learningPathData);
  },

  // Update learning path (admin/manager/content creator)
  updateLearningPath: (id, learningPathData) => {
    return axiosClient.put(`/learning-paths/${id}`, learningPathData);
  },

  // Delete learning path (admin/manager)
  deleteLearningPath: (id) => {
    return axiosClient.delete(`/learning-paths/${id}`);
  },

  // Publish learning path (admin/manager/content creator)
  publishLearningPath: (id) => {
    return axiosClient.patch(`/learning-paths/${id}/publish`);
  },

  // Archive learning path (admin/manager/content creator)
  archiveLearningPath: (id) => {
    return axiosClient.patch(`/learning-paths/${id}/archive`);
  },

  // Bulk operations
  bulkPublish: (ids) => {
    return Promise.all(ids.map(id => learningPathService.publishLearningPath(id)));
  },

  bulkArchive: (ids) => {
    return Promise.all(ids.map(id => learningPathService.archiveLearningPath(id)));
  },

  bulkDelete: (ids) => {
    return Promise.all(ids.map(id => learningPathService.deleteLearningPath(id)));
  }
};

export default learningPathService;