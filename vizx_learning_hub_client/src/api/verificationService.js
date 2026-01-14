import axiosClient from '../utils/axiosClient';

const verificationService = {
    requestPasswordReset: (email) => {
        return axiosClient.post('/verification/request-password-reset', { email });
    },

    validateResetToken: (token) => {
        return axiosClient.get(`/verification/validate-reset-token/${token}`);
    },

    completePasswordReset: (data) => {
        return axiosClient.post('/verification/complete-password-reset', data);
    },

    verifyEmail: (code) => {
        return axiosClient.post('/verification/verify', { code });
    },

    resendVerificationCode: () => {
        return axiosClient.post('/verification/resend');
    },

    forcePasswordChange: (data) => {
        return axiosClient.post('/verification/force-password-change', data);
    },

    getVerificationStatus: () => {
        return axiosClient.get('/verification/status');
    },

    // Manager Routes
    createEmployeeByManager: (employeeData) => {
        return axiosClient.post('/verification/manager/employees', employeeData);
    },

    getManagerEmployeeById: (employeeId) => {
        return axiosClient.get(`/verification/manager/employees/${employeeId}`);
    },

    updateEmployeeByManager: (employeeId, employeeData) => {
        return axiosClient.put(`/verification/manager/employees/${employeeId}`, employeeData);
    },

    deactivateEmployee: (employeeId) => {
        return axiosClient.delete(`/verification/manager/employees/${employeeId}`);
    },

    // Admin Routes
    resetPasswordByAdmin: (userId) => {
        return axiosClient.post(`/verification/admin/reset-password/${userId}`);
    },

    testEmailService: (email) => {
        return axiosClient.post('/verification/test-email', { email });
    }
};

export default verificationService;
