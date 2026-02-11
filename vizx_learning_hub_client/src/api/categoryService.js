import axiosClient from '../utils/axiosClient';

const categoryService = {
  getAllCategories: async () => {
    const response = await axiosClient.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await axiosClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await axiosClient.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await axiosClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  },

  getSubCategories: async (categoryId) => {
    const response = await axiosClient.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  createSubCategory: async (categoryId, subCategoryData) => {
    const response = await axiosClient.post(`/categories/${categoryId}/subcategories`, subCategoryData);
    return response.data;
  },

  updateSubCategory: async (id, subCategoryData) => {
    const response = await axiosClient.put(`/categories/subcategories/${id}`, subCategoryData);
    return response.data;
  },

  deleteSubCategory: async (id) => {
    const response = await axiosClient.delete(`/categories/subcategories/${id}`);
    return response.data;
  }
};

export default categoryService;
