import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  updateUserSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  userQuerySchema,
} from '../validator/user.validator';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getCurrentUser);
router.get('/stats', authorize('ADMIN', 'MANAGER'), UserController.getUserStats);
router.get('/all', authorize('ADMIN', 'MANAGER'), validate(userQuerySchema, 'query'), UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);
router.patch('/:id/status', authorize('ADMIN'), validate(updateUserStatusSchema), UserController.updateUserStatus);
router.patch('/:id/role', authorize('ADMIN'), validate(updateUserRoleSchema), UserController.updateUserRole);
router.delete('/:id', authorize('ADMIN'), UserController.deleteUser);

export default router;