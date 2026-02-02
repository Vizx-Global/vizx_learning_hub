import axiosClient from '../utils/axiosClient';

const moduleService = {
  getModulesByLearningPath: (learningPathId) => axiosClient.get(`/modules/learning-path/${learningPathId}`),
  getModulesByContentType: (contentType) => axiosClient.get(`/modules/content-type/${contentType}`),
  getModuleById: (id) => axiosClient.get(`/modules/${id}`),
  getAllModules: (queryParams = {}) => axiosClient.get('/modules', { params: queryParams }),
  validateModule: (id) => axiosClient.get(`/modules/${id}/validate`),
  getModuleCountByLearningPath: (learningPathId) => axiosClient.get(`/modules/learning-path/${learningPathId}/count`),
  uploadFiles: (formData) => axiosClient.post('/modules/upload/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadThumbnail: (formData) => axiosClient.post('/modules/upload/thumbnail', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile: (publicId) => axiosClient.delete(`/modules/upload/files/${publicId}`),
  createModuleWithFiles: (formData) => axiosClient.post('/modules/with-files', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateModuleWithFiles: (id, formData) => axiosClient.put(`/modules/${id}/with-files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createModule: (moduleData) => axiosClient.post('/modules', moduleData),
  updateModule: (id, moduleData) => axiosClient.put(`/modules/${id}`, moduleData),
  updateModuleOrder: (id, orderIndex) => axiosClient.patch(`/modules/${id}/order`, { orderIndex }),
  activateModule: (id) => axiosClient.patch(`/modules/${id}/activate`),
  deactivateModule: (id) => axiosClient.patch(`/modules/${id}/deactivate`),
  updateModuleThumbnail: (id, formData) => axiosClient.patch(`/modules/${id}/thumbnail`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getModuleStats: () => axiosClient.get('/modules/stats'),
  deleteModule: (id) => axiosClient.delete(`/modules/${id}`)
};

export default moduleService;
