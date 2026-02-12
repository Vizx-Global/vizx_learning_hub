import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
} from '../validator/category.validator';

const router = Router();

// Category Routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin-only Routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createCategorySchema),
  CategoryController.createCategory
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  CategoryController.deleteCategory
);

// SubCategory Routes
router.get('/:categoryId/subcategories', CategoryController.getSubCategoriesByCategory);

router.post(
  '/:categoryId/subcategories',
  authenticate,
  authorize('ADMIN'),
  validate(createSubCategorySchema),
  CategoryController.createSubCategory
);

router.put(
  '/subcategories/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateSubCategorySchema),
  CategoryController.updateSubCategory
);

router.delete(
  '/subcategories/:id',
  authenticate,
  authorize('ADMIN'),
  CategoryController.deleteSubCategory
);

export default router;
