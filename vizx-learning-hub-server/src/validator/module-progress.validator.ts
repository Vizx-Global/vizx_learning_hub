import Joi from 'joi';

export const moduleProgressValidators = {
  updateModuleProgressSchema: Joi.object({
    progress: Joi.number().min(0).max(100)
      .messages({
        'number.min': 'Progress must be at least 0',
        'number.max': 'Progress cannot exceed 100'
      }),
    timeSpent: Joi.number().min(0)
      .messages({
        'number.min': 'Time spent must be at least 0'
      }),
    status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')
      .messages({
        'any.only': 'Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED'
      }),
    notes: Joi.string().max(2000),
    bookmarked: Joi.boolean(),
    quizScore: Joi.number().min(0).max(100)
  }).min(1),

  markModuleCompleteSchema: Joi.object({
    quizScore: Joi.number().min(0).max(100),
    timeSpent: Joi.number().min(0),
    notes: Joi.string().max(2000)
  }),

  queryModuleProgressSchema: Joi.object({
    status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'),
    enrollmentId: Joi.string().uuid(),
    moduleId: Joi.string().uuid(),
    bookmarked: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('lastAccessedAt', 'progress', 'createdAt', 'orderIndex').default('orderIndex'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
    includeModule: Joi.boolean().default(true)
  }),

  bulkUpdateProgressSchema: Joi.array().items(
    Joi.object({
      moduleId: Joi.string().uuid().required(),
      progress: Joi.number().min(0).max(100).required(),
      timeSpent: Joi.number().min(0),
      status: Joi.string().valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')
    })
  ).min(1).max(50),

  contentProgressSchema: Joi.object({
    contentType: Joi.string().valid('TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK').required(),
    contentId: Joi.string(),
    progress: Joi.number().min(0).max(100).required(),
    duration: Joi.number().min(0),
    completed: Joi.boolean()
  }).required()
};