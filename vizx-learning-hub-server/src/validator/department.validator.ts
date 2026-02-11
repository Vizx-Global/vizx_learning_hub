import Joi from 'joi';

export const departmentValidators = {
  createDepartmentSchema: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, '').optional(),
    managerId: Joi.string().uuid().allow(null, '').optional(),
    isActive: Joi.boolean().optional().default(true),
  }),

  updateDepartmentSchema: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow(null, '').optional(),
    managerId: Joi.string().uuid().allow(null, '').optional(),
    isActive: Joi.boolean().optional(),
  }),

  queryDepartmentSchema: Joi.object({
    search: Joi.string().allow('').optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};
