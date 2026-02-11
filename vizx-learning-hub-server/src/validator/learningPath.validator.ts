import Joi from 'joi';

export const createLearningPathSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().required(),
  shortDescription: Joi.string().max(500).optional(),
  category: Joi.string().max(100).optional(),
  categoryId: Joi.string().uuid().optional(),
  subcategory: Joi.string().max(100).optional(),
  subCategoryId: Joi.string().uuid().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').default('BEGINNER'),
  estimatedHours: Joi.number().positive().required(),
  minEstimatedHours: Joi.number().positive().optional(),
  maxEstimatedHours: Joi.number().positive().optional(),
  thumbnailUrl: Joi.string().uri().max(500).optional(),
  bannerUrl: Joi.string().uri().max(500).optional(),
  iconUrl: Joi.string().uri().max(500).optional(),
  prerequisites: Joi.array().items(Joi.string()).optional(),
  learningObjectives: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  featuredOrder: Joi.number().integer().min(0).optional()
});

export const updateLearningPathSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  shortDescription: Joi.string().max(500).optional(),
  category: Joi.string().max(100).optional(),
  categoryId: Joi.string().uuid().optional(),
  subcategory: Joi.string().max(100).optional(),
  subCategoryId: Joi.string().uuid().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional(),
  estimatedHours: Joi.number().positive().optional(),
  minEstimatedHours: Joi.number().positive().optional(),
  maxEstimatedHours: Joi.number().positive().optional(),
  thumbnailUrl: Joi.string().uri().max(500).optional(),
  bannerUrl: Joi.string().uri().max(500).optional(),
  iconUrl: Joi.string().uri().max(500).optional(),
  prerequisites: Joi.array().items(Joi.string()).optional(),
  learningObjectives: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW').optional(),
  isPublic: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  featuredOrder: Joi.number().integer().min(0).optional()
});

export const learningPathQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().optional(),
  categoryId: Joi.string().uuid().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW').optional(),
  isFeatured: Joi.boolean().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt', 'estimatedHours', 'enrollmentCount', 'averageRating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});