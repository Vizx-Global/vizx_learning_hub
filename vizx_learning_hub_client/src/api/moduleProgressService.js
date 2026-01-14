import axiosClient from '../utils/axiosClient';

const moduleProgressService = {
    getModuleProgress: (enrollmentId, moduleId) => {
        return axiosClient.get(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}`);
    },

    updateModuleProgress: (enrollmentId, moduleId, progressData) => {
        return axiosClient.put(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}`, progressData);
    },

    trackContentProgress: (enrollmentId, moduleId, contentProgressData) => {
        return axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/track`, contentProgressData);
    },

    markModuleComplete: (enrollmentId, moduleId, completionData = {}) => {
        return axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/complete`, completionData);
    },

    getProgressSummary: (enrollmentId) => {
        return axiosClient.get(`/module-progress/enrollments/${enrollmentId}/summary`);
    },

    getUserProgressOverview: () => {
        return axiosClient.get('/module-progress/overview');
    },

    getBookmarkedModules: (queryParams = {}) => {
        return axiosClient.get('/module-progress/bookmarks', { params: queryParams });
    },

    bookmarkModule: (enrollmentId, moduleId) => {
        return axiosClient.post(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/bookmark`);
    },

    removeBookmark: (enrollmentId, moduleId) => {
        return axiosClient.delete(`/module-progress/enrollments/${enrollmentId}/modules/${moduleId}/bookmark`);
    }
};

export default moduleProgressService;
