import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  verifyEmailSchema,
  resendVerificationSchema,
  createEmployeeSchema,
  forcePasswordChangeSchema,
  requestPasswordResetSchema,
  completePasswordResetSchema,
} from '../validator/verification.validator';

const router = Router();

router.post('/request-password-reset', validate(requestPasswordResetSchema), VerificationController.requestPasswordReset);
router.get('/validate-reset-token/:token', VerificationController.validateResetToken);
router.post('/complete-password-reset', validate(completePasswordResetSchema), VerificationController.completePasswordReset);
router.post('/verify', authenticate, validate(verifyEmailSchema), VerificationController.verifyEmail);
router.post('/resend', validate(resendVerificationSchema, 'body'), (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
}, VerificationController.resendVerificationCode);
router.post('/force-password-change', authenticate, validate(forcePasswordChangeSchema), VerificationController.forcePasswordChange);
router.get('/status', authenticate, VerificationController.getVerificationStatus);
router.post('/manager/employees', authenticate, authorize('MANAGER'), validate(createEmployeeSchema), VerificationController.createEmployeeByManager);
router.get('/manager/employees/:employeeId', authenticate, authorize('MANAGER'), VerificationController.getManagerEmployeeById);
router.put('/manager/employees/:employeeId', authenticate, authorize('MANAGER'), validate(createEmployeeSchema), VerificationController.updateEmployeeByManager);
router.delete('/manager/employees/:employeeId', authenticate, authorize('MANAGER'), VerificationController.deactivateEmployee);
router.post('/admin/reset-password/:userId', authenticate, authorize('ADMIN'), VerificationController.resetPasswordByAdmin);
router.post('/test-email', authenticate, authorize('ADMIN'), VerificationController.testEmailService);

export default router;