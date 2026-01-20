import axiosClient from '../utils/axiosClient';

const authService = {
  register: (userData) => axiosClient.post('/auth/register', userData),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  refreshToken: () => axiosClient.post('/auth/refresh-token'),
  logout: () => axiosClient.post('/auth/logout'),
  getProfile: () => axiosClient.get('/auth/profile'),
  changePassword: (passwordData) => axiosClient.put('/auth/change-password', passwordData),
  createUser: (userData) => axiosClient.post('/auth/users', userData)
};

export default authService;
