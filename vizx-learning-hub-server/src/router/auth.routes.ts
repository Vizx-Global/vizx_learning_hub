import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  changePasswordSchema,
} from '../validator/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/users', authenticate, authorize('ADMIN', 'MANAGER'), validate(createUserSchema), AuthController.createUser);

export default router;