import axiosClient from '../utils/axiosClient';

const userService = {
  getCurrentUserProfile: () => axiosClient.get('/users/profile'),
  getUserStats: () => axiosClient.get('/users/stats'),
  getAllUsers: (queryParams = {}) => axiosClient.get('/users/all', { params: queryParams }),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  getUserLearningHistory: (id) => axiosClient.get(`/users/${id}/history`),
  getUserAchievements: (id) => axiosClient.get(`/users/${id}/achievements`),
  getUserPreferences: (id) => axiosClient.get(`/users/${id}/preferences`),
  updateUserPreferences: (id, preferences) => axiosClient.put(`/users/${id}/preferences`, preferences),
  updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
  updateUserStatus: (id, status) => axiosClient.patch(`/users/${id}/status`, { status }),
  updateUserRole: (id, role) => axiosClient.patch(`/users/${id}/role`, { role }),
  getUserActivitySummary: (id) => axiosClient.get(`/users/${id}/activity-summary`),
  uploadAvatar: (id, formData) => axiosClient.post(`/users/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`)
};

export default userService;
