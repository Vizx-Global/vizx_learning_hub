import axiosClient from '../../../utils/axiosClient';

const moduleService = {
  // Get all modules (protected)
  getAllModules: (queryParams = {}) => {
    return axiosClient.get('/modules', { params: queryParams });
  },

  // Get module by ID (protected)
  getModuleById: (id) => {
    return axiosClient.get(`/modules/${id}`);
  },

  // Get modules by learning path (protected)
  getModulesByLearningPath: (learningPathId) => {
    return axiosClient.get(`/modules/learning-path/${learningPathId}`);
  },

  // Get modules by content type (protected)
  getModulesByContentType: (contentType) => {
    return axiosClient.get(`/modules/content-type/${contentType}`);
  },

  // Get module count by learning path (protected)
  getModuleCountByLearningPath: (learningPathId) => {
    return axiosClient.get(`/modules/learning-path/${learningPathId}/count`);
  }
};

export default moduleService;