import Joi from 'joi';

export const createModuleSchema = Joi.object({
  learningPathId: Joi.string().uuid().required(),
  title: Joi.string().max(200).required(),
  description: Joi.string().required(),
  shortDescription: Joi.string().max(500).optional().allow('', null),
  orderIndex: Joi.number().integer().min(0).optional(),
  content: Joi.string().optional().allow('', null),
  contentType: Joi.string().valid('TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK').default('TEXT'),
  category: Joi.string().max(100).required(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').default('BEGINNER'),
  estimatedMinutes: Joi.number().integer().positive().required(),
  minEstimatedMinutes: Joi.number().integer().positive().optional(),
  maxEstimatedMinutes: Joi.number().integer().positive().optional(),
  videoUrl: Joi.string().uri().max(500).optional().allow('', null),
  audioUrl: Joi.string().uri().max(500).optional().allow('', null),
  documentUrl: Joi.string().uri().max(500).optional().allow('', null),
  externalLink: Joi.string().uri().max(500).optional().allow('', null),
  thumbnailUrl: Joi.string().uri().max(500).optional().allow('', null),
  resources: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  attachments: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  prerequisites: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  learningObjectives: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  keyConcepts: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
  isOptional: Joi.boolean().default(false),
  requiresCompletion: Joi.boolean().default(true),
  completionPoints: Joi.number().integer().min(0).default(100),
  maxQuizAttempts: Joi.number().integer().min(1).optional(),
  videoDuration: Joi.number().integer().positive().optional(),
  audioDuration: Joi.number().integer().positive().optional(),
  documentPages: Joi.number().integer().positive().optional(),
  interactiveType: Joi.string().optional(),
  quizQuestions: Joi.number().integer().positive().optional(),
  assessmentWeight: Joi.number().integer().min(0).max(100).optional(),
  externalLinkType: Joi.string().optional()
}).custom((value, helpers) => {
  const { contentType, content, externalLink } = value;
  const arrayFields = ['resources', 'attachments', 'prerequisites', 'learningObjectives', 'tags', 'keyConcepts'];
  arrayFields.forEach(field => {
    if (typeof value[field] === 'string') {
      try { value[field] = JSON.parse(value[field]); }
      catch (e) { value[field] = value[field] ? [value[field]] : []; }
    }
  });
  
  if (contentType === 'TEXT' && (!content || (typeof content === 'string' && content.trim() === ''))) {
    return helpers.error('any.invalid', { message: 'Text content is required for TEXT content type' });
  }
  if (contentType === 'EXTERNAL_LINK' && (!externalLink || (typeof externalLink === 'string' && externalLink.trim() === ''))) {
    return helpers.error('any.invalid', { message: 'External link URL is required for EXTERNAL_LINK' });
  }
  if (['QUIZ', 'ASSESSMENT'].includes(contentType) && (value.maxQuizAttempts === undefined || value.maxQuizAttempts === null)) {
    value.maxQuizAttempts = 3;
  }
  return value;
});

export const updateModuleSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  shortDescription: Joi.string().max(500).optional().allow('', null),
  orderIndex: Joi.number().integer().min(0).optional(),
  content: Joi.string().optional().allow('', null),
  contentType: Joi.string().valid('TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK').optional(),
  category: Joi.string().max(100).optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional(),
  estimatedMinutes: Joi.number().integer().positive().optional(),
  minEstimatedMinutes: Joi.number().integer().positive().optional(),
  maxEstimatedMinutes: Joi.number().integer().positive().optional(),
  videoUrl: Joi.string().uri().max(500).optional().allow('', null),
  audioUrl: Joi.string().uri().max(500).optional().allow('', null),
  documentUrl: Joi.string().uri().max(500).optional().allow('', null),
  externalLink: Joi.string().uri().max(500).optional().allow('', null),
  thumbnailUrl: Joi.string().uri().max(500).optional().allow('', null),
  resources: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  attachments: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  prerequisites: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  learningObjectives: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  keyConcepts: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
  isOptional: Joi.boolean().optional(),
  requiresCompletion: Joi.boolean().optional(),
  completionPoints: Joi.number().integer().min(0).optional(),
  maxQuizAttempts: Joi.number().integer().min(1).optional(),
  videoDuration: Joi.number().integer().positive().optional(),
  audioDuration: Joi.number().integer().positive().optional(),
  documentPages: Joi.number().integer().positive().optional(),
  interactiveType: Joi.string().optional(),
  quizQuestions: Joi.number().integer().positive().optional(),
  assessmentWeight: Joi.number().integer().min(0).max(100).optional(),
  externalLinkType: Joi.string().optional()
}).custom((value, helpers) => {
  const arrayFields = ['resources', 'attachments', 'prerequisites', 'learningObjectives', 'tags', 'keyConcepts'];
  arrayFields.forEach(field => {
    if (typeof value[field] === 'string') {
      try { value[field] = JSON.parse(value[field]); }
      catch (e) { value[field] = value[field] ? [value[field]] : []; }
    }
  });
  return value;
});

export const moduleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  learningPathId: Joi.string().uuid().optional(),
  category: Joi.string().optional(),
  difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT').optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional(),
  contentType: Joi.string().valid('TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK').optional(),
  sortBy: Joi.string().valid('title', 'orderIndex', 'createdAt', 'estimatedMinutes', 'updatedAt').default('orderIndex'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

export const updateModuleOrderSchema = Joi.object({
  orderIndex: Joi.number().integer().min(0).required()
});

export const bulkUpdateOrderSchema = Joi.object({
  updates: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      orderIndex: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
});

export const fileUploadSchema = Joi.object({
  folder: Joi.string().optional()
});