import Joi from 'joi';

export const enrollmentValidators = {
  createEnrollmentSchema: Joi.object({
    learningPathId: Joi.string().uuid().required()
      .messages({
        'string.guid': 'Learning path ID must be a valid UUID',
        'any.required': 'Learning path ID is required'
      })
  }),

  updateEnrollmentSchema: Joi.object({
    status: Joi.string().valid('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'PAUSED')
      .messages({
        'any.only': 'Status must be one of: ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, PAUSED'
      }),
    progress: Joi.number().min(0).max(100)
      .messages({
        'number.min': 'Progress must be at least 0',
        'number.max': 'Progress cannot exceed 100'
      }),
    dueDate: Joi.date().iso().greater('now')
      .messages({
        'date.greater': 'Due date must be in the future'
      }),
    lastAccessedAt: Joi.date().iso()
  }).min(1),

  queryEnrollmentSchema: Joi.object({
    status: Joi.string().valid('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'PAUSED'),
    learningPathId: Joi.string().uuid(),
    userId: Joi.string().uuid(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('enrolledAt', 'progress', 'lastAccessedAt', 'dueDate').default('enrolledAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    includePath: Joi.boolean().default(false),
    includeProgress: Joi.boolean().default(false)
  })
};