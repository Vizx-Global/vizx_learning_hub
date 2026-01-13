import { ObjectSchema } from 'joi';

export const validateRequest = <T>(schema: ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const validationError = new Error('ValidationError');
    (validationError as any).details = error.details;
    (validationError as any).message = error.details.map(detail => detail.message).join(', ');
    throw validationError;
  }

  return value;
};