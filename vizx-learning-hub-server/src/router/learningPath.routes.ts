import { Router } from 'express';
import { LearningPathController } from '../controllers/learningPath.controller';
import { LearningPathService } from '../services/learningPath.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createLearningPathSchema, 
  updateLearningPathSchema, 
  learningPathQuerySchema 
} from '../validator/learningPath.validator';

const router = Router();

// Initialize controller
const learningPathService = new LearningPathService();
const learningPathController = new LearningPathController(learningPathService);

// Public routes
router.get(
  '/featured',
  validate(learningPathQuerySchema, 'query'),
  learningPathController.getFeaturedLearningPaths
);

router.get(
  '/category/:category',
  validate(learningPathQuerySchema, 'query'),
  learningPathController.getLearningPathsByCategory
);

router.get(
  '/slug/:slug',
  learningPathController.getLearningPathBySlug
);

// Protected routes - require authentication
router.use(authenticate);

router.get(
  '/',
  validate(learningPathQuerySchema, 'query'),
  learningPathController.getAllLearningPaths
);

router.get(
  '/:id',
  learningPathController.getLearningPathById
);

// Admin and Manager only routes
router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  validate(createLearningPathSchema),
  learningPathController.createLearningPath
);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  validate(updateLearningPathSchema),
  learningPathController.updateLearningPath
);

router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  learningPathController.deleteLearningPath
);

router.patch(
  '/:id/publish',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  learningPathController.publishLearningPath
);

router.patch(
  '/:id/archive',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  learningPathController.archiveLearningPath
);

export default router;