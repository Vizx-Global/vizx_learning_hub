import { Router } from 'express';
import { AchievementController } from '../controllers/achievement.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public/All authenticated users routes
router.get('/', authenticate, AchievementController.getAllAchievements);
router.get('/:id', authenticate, AchievementController.getAchievementById);

// Admin only routes
router.post('/', authenticate, authorize('ADMIN'), AchievementController.createAchievement);
router.put('/:id', authenticate, authorize('ADMIN'), AchievementController.updateAchievement);
router.delete('/:id', authenticate, authorize('ADMIN'), AchievementController.deleteAchievement);

export default router;
