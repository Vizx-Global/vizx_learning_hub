import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';

export class CategoryController {
  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  });

  static getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();
    res.json({
      success: true,
      data: categories,
    });
  });

  static getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.getCategoryById(req.params.id);
    res.json({
      success: true,
      data: category,
    });
  });

  static updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  });

  static deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await CategoryService.deleteCategory(req.params.id);
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  });

  // --- SubCategory ---

  static createSubCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const subcategory = await CategoryService.createSubCategory(categoryId, req.body);
    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: subcategory,
    });
  });

  static updateSubCategory = asyncHandler(async (req: Request, res: Response) => {
    const subcategory = await CategoryService.updateSubCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Sub-category updated successfully',
      data: subcategory,
    });
  });

  static deleteSubCategory = asyncHandler(async (req: Request, res: Response) => {
    await CategoryService.deleteSubCategory(req.params.id);
    res.json({
      success: true,
      message: 'Sub-category deleted successfully',
    });
  });

  static getSubCategoriesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const subcategories = await CategoryService.getSubCategoriesByCategoryId(req.params.categoryId);
    res.json({
      success: true,
      data: subcategories,
    });
  });
}
