import { CategoryRepository, CreateCategoryData, UpdateCategoryData } from '../repositories/category.repository';
import { NotFoundError } from '../utils/error-handler';

export class CategoryService {
  static async createCategory(data: CreateCategoryData) {
    return CategoryRepository.create(data);
  }

  static async getAllCategories() {
    return CategoryRepository.findAll();
  }

  static async getCategoryById(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  static async updateCategory(id: string, data: UpdateCategoryData) {
    return CategoryRepository.update(id, data);
  }

  static async deleteCategory(id: string) {
    return CategoryRepository.delete(id);
  }

  // --- SubCategory ---

  static async createSubCategory(categoryId: string, data: { name: string; description?: string }) {
    return CategoryRepository.createSubCategory(categoryId, data);
  }

  static async updateSubCategory(id: string, data: { name?: string; description?: string }) {
    return CategoryRepository.updateSubCategory(id, data);
  }

  static async deleteSubCategory(id: string) {
    return CategoryRepository.deleteSubCategory(id);
  }

  static async getSubCategoriesByCategoryId(categoryId: string) {
    return CategoryRepository.findSubCategoriesByCategoryId(categoryId);
  }
}
