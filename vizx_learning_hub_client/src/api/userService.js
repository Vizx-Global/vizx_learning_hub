import axiosClient from '../utils/axiosClient';

const userService = {
  getCurrentUserProfile: () => axiosClient.get('/users/profile'),
  getUserStats: () => axiosClient.get('/users/stats'),
  getAllUsers: (queryParams = {}) => axiosClient.get('/users/all', { params: queryParams }),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
  updateUserStatus: (id, status) => axiosClient.patch(`/users/${id}/status`, { status }),
  updateUserRole: (id, role) => axiosClient.patch(`/users/${id}/role`, { role }),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`)
};

export default userService;
