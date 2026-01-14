import axiosClient from '../utils/axiosClient';

const userService = {
    getCurrentUserProfile: () => {
        return axiosClient.get('/users/profile');
    },

    getUserStats: () => {
        return axiosClient.get('/users/stats');
    },

    getAllUsers: (queryParams = {}) => {
        return axiosClient.get('/users/all', { params: queryParams });
    },

    getUserById: (id) => {
        return axiosClient.get(`/users/${id}`);
    },

    updateUser: (id, userData) => {
        return axiosClient.put(`/users/${id}`, userData);
    },

    updateUserStatus: (id, status) => {
        return axiosClient.patch(`/users/${id}/status`, { status });
    },

    updateUserRole: (id, role) => {
        return axiosClient.patch(`/users/${id}/role`, { role });
    },

    deleteUser: (id) => {
        return axiosClient.delete(`/users/${id}`);
    }
};

export default userService;
