import axiosClient from '../../../utils/axiosClient';

const moduleService = {
    getModulesByLearningPath: (learningPathId) => {
        return axiosClient.get(`/modules/learning-path/${learningPathId}`);
    },

    getModulesByContentType: (contentType) => {
        return axiosClient.get(`/modules/content-type/${contentType}`);
    },

    getModuleById: (id) => {
        return axiosClient.get(`/modules/${id}`);
    },

    getAllModules: (queryParams = {}) => {
        return axiosClient.get('/modules', { params: queryParams });
    },

    validateModule: (id) => {
        return axiosClient.get(`/modules/${id}/validate`);
    },

    getModuleCountByLearningPath: (learningPathId) => {
        return axiosClient.get(`/modules/learning-path/${learningPathId}/count`);
    },

    // File Uploads
    uploadFiles: (formData) => {
        return axiosClient.post('/modules/upload/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    uploadThumbnail: (formData) => {
        return axiosClient.post('/modules/upload/thumbnail', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteFile: (publicId) => {
        return axiosClient.delete(`/modules/upload/files/${publicId}`);
    },

    // CRUD with Files
    createModuleWithFiles: (formData) => {
        return axiosClient.post('/modules/with-files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    updateModuleWithFiles: (id, formData) => {
        return axiosClient.put(`/modules/${id}/with-files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    createModule: (moduleData) => {
        return axiosClient.post('/modules', moduleData);
    },

    updateModule: (id, moduleData) => {
        return axiosClient.put(`/modules/${id}`, moduleData);
    },

    updateModuleOrder: (id, orderIndex) => {
        return axiosClient.patch(`/modules/${id}/order`, { orderIndex });
    },

    activateModule: (id) => {
        return axiosClient.patch(`/modules/${id}/activate`);
    },

    deactivateModule: (id) => {
        return axiosClient.patch(`/modules/${id}/deactivate`);
    },

    updateModuleThumbnail: (id, formData) => {
        return axiosClient.patch(`/modules/${id}/thumbnail`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteModule: (id) => {
        return axiosClient.delete(`/modules/${id}`);
    }
};

export default moduleService;
