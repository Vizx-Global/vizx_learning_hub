import axiosClient from '../utils/axiosClient';

const departmentService = {
  // Create a new department
  createDepartment: (data) => axiosClient.post('/departments', data),

  // Get all departments with optional filtering and pagination
  getAllDepartments: (params = {}) => axiosClient.get('/departments', { params }),

  // Get department rankings
  getDepartmentRankings: (limit = 10) => axiosClient.get('/departments/rankings', { params: { limit } }),

  // Get a single department by ID
  getDepartmentById: (id) => axiosClient.get(`/departments/${id}`),

  // Get department performance statistics
  getDepartmentPerformance: (id) => axiosClient.get(`/departments/${id}/performance`),

  // Compare department completion rates and learning progress
  getDepartmentComparison: (limit = 10) => axiosClient.get('/departments/rankings', { params: { limit } }),

  // Update a department
  updateDepartment: (id, data) => axiosClient.put(`/departments/${id}`, data),

  // Delete a department
  deleteDepartment: (id) => axiosClient.delete(`/departments/${id}`),
};

export default departmentService;
