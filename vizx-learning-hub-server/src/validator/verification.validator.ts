import Joi from 'joi';

// Verification code validation schema
export const verifyEmailSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.length': 'Verification code must be exactly 6 digits',
      'string.pattern.base': 'Verification code must contain only numbers',
      'any.required': 'Verification code is required',
    }),
});

// Resend verification request schema
export const resendVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Reset password by admin schema
export const resetPasswordByAdminSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
});

// Create employee by manager schema
export const createEmployeeSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  employeeId: Joi.string()
    .optional()
    .allow('')
    .max(20)
    .messages({
      'string.max': 'Employee ID cannot exceed 20 characters',
    }),
  phone: Joi.string()
    .optional()
    .allow('')
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .messages({
      'string.pattern.base': 'Invalid phone number format',
    }),
  jobTitle: Joi.string()
    .optional()
    .allow('')
    .max(100)
    .messages({
      'string.max': 'Job title cannot exceed 100 characters',
    }),
});

// Force password change schema
export const forcePasswordChangeSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Request password reset schema
export const requestPasswordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Validate password reset token schema
export const validateResetTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),
});

// Complete password reset schema
export const completePasswordResetSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Export all verification schemas
export const VerificationSchemas = {
  verifyEmailSchema,
  resendVerificationSchema,
  resetPasswordByAdminSchema,
  createEmployeeSchema,
  forcePasswordChangeSchema,
  requestPasswordResetSchema,
  validateResetTokenSchema,
  completePasswordResetSchema,
};

export default VerificationSchemas;