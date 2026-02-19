import { Router } from 'express';
import { LearningPathController } from '../controllers/learningPath.controller';
import { LearningPathService } from '../services/learningPath.service';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createLearningPathSchema, 
  updateLearningPathSchema, 
  learningPathQuerySchema 
} from '../validator/learningPath.validator';

const router = Router();
const learningPathService = new LearningPathService();
const learningPathController = new LearningPathController(learningPathService);

router.get('/featured', optionalAuth, validate(learningPathQuerySchema, 'query'), learningPathController.getFeaturedLearningPaths);
router.get('/category/:category', optionalAuth, validate(learningPathQuerySchema, 'query'), learningPathController.getLearningPathsByCategory);
router.get('/slug/:slug', optionalAuth, learningPathController.getLearningPathBySlug);

// Public access with optional auth to let admins see drafts
router.get('/', optionalAuth, validate(learningPathQuerySchema, 'query'), learningPathController.getAllLearningPaths);
router.get('/:id', optionalAuth, learningPathController.getLearningPathById);

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), validate(createLearningPathSchema), learningPathController.createLearningPath);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), validate(updateLearningPathSchema), learningPathController.updateLearningPath);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), learningPathController.deleteLearningPath);
router.patch('/:id/publish', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), learningPathController.publishLearningPath);
router.patch('/:id/archive', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), learningPathController.archiveLearningPath);

export default router;