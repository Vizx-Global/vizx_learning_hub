import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('', null).optional(),
  iconUrl: Joi.string().allow('', null).optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().allow('', null).optional(),
  iconUrl: Joi.string().allow('', null).optional(),
});

export const createSubCategorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('', null).optional(),
});

export const updateSubCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().allow('', null).optional(),
});
