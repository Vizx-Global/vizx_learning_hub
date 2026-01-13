import Joi from 'joi';

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional().allow(''),
  avatar: Joi.string().uri().optional().allow(''),
  department: Joi.string().optional().allow(''),
  jobTitle: Joi.string().optional().allow(''),
  role: Joi.string().valid('EMPLOYEE', 'MANAGER', 'ADMIN').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING').optional(),
  managerId: Joi.string().optional().allow(null),
}).min(1); // At least one field must be provided

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING').required(),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('EMPLOYEE', 'MANAGER', 'ADMIN').required(),
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid('EMPLOYEE', 'MANAGER', 'ADMIN').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING').optional(),
  department: Joi.string().optional(),
  search: Joi.string().optional(),
});