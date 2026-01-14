import axiosClient from '../utils/axiosClient';

const authService = {
    register: (userData) => {
        return axiosClient.post('/auth/register', userData);
    },

    login: (credentials) => {
        return axiosClient.post('/auth/login', credentials);
    },

    refreshToken: () => {
        return axiosClient.post('/auth/refresh-token');
    },

    logout: () => {
        return axiosClient.post('/auth/logout');
    },

    getProfile: () => {
        return axiosClient.get('/auth/profile');
    },

    changePassword: (passwordData) => {
        return axiosClient.put('/auth/change-password', passwordData);
    },

    // Admin/Manager create user
    createUser: (userData) => {
        return axiosClient.post('/auth/users', userData);
    }
};

export default authService;
