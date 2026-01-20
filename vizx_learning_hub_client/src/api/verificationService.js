import axiosClient from '../utils/axiosClient';

const verificationService = {
  requestPasswordReset: (email) => axiosClient.post('/verification/request-password-reset', { email }),
  validateResetToken: (token) => axiosClient.get(`/verification/validate-reset-token/${token}`),
  completePasswordReset: (data) => axiosClient.post('/verification/complete-password-reset', data),
  verifyEmail: (code) => axiosClient.post('/verification/verify', { code }),
  resendVerificationCode: () => axiosClient.post('/verification/resend'),
  forcePasswordChange: (data) => axiosClient.post('/verification/force-password-change', data),
  getVerificationStatus: () => axiosClient.get('/verification/status'),
  createEmployeeByManager: (employeeData) => axiosClient.post('/verification/manager/employees', employeeData),
  getManagerEmployeeById: (employeeId) => axiosClient.get(`/verification/manager/employees/${employeeId}`),
  updateEmployeeByManager: (employeeId, employeeData) => axiosClient.put(`/verification/manager/employees/${employeeId}`, employeeData),
  deactivateEmployee: (employeeId) => axiosClient.delete(`/verification/manager/employees/${employeeId}`),
  resetPasswordByAdmin: (userId) => axiosClient.post(`/verification/admin/reset-password/${userId}`),
  testEmailService: (email) => axiosClient.post('/verification/test-email', { email })
};

export default verificationService;
