import { Router } from 'express';
import { ModuleProgressController } from '../controllers/module-progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { ModuleProgressService } from '../services/module-progress.service';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validation.middleware';
import { moduleProgressValidators } from '../validator/module-progress.validator';

const router = Router();
const prisma = new PrismaClient();
const moduleProgressService = new ModuleProgressService(prisma);
const moduleProgressController = new ModuleProgressController(moduleProgressService);

console.log('Module Progress Router initialized');
router.use(authenticate);
router.get(
  '/enrollments/:enrollmentId/modules/:moduleId',
  moduleProgressController.getModuleProgress
);
router.put(
  '/enrollments/:enrollmentId/modules/:moduleId',
  validate(moduleProgressValidators.updateModuleProgressSchema),
  moduleProgressController.updateModuleProgress
);
router.post(
  '/enrollments/:enrollmentId/modules/:moduleId/track',
  validate(moduleProgressValidators.contentProgressSchema),
  moduleProgressController.trackContentProgress
);
router.post(
  '/enrollments/:enrollmentId/modules/:moduleId/complete',
  validate(moduleProgressValidators.markModuleCompleteSchema),
  moduleProgressController.markModuleComplete
);
router.get(
  '/enrollments/:enrollmentId/summary',
  moduleProgressController.getProgressSummary
);
router.get(
  '/overview',
  moduleProgressController.getUserProgressOverview
);
router.get(
  '/bookmarks',
  validate(moduleProgressValidators.queryModuleProgressSchema, 'query'),
  moduleProgressController.getBookmarkedModules
);
router.post(
  '/enrollments/:enrollmentId/modules/:moduleId/bookmark',
  moduleProgressController.bookmarkModule
);
router.delete(
  '/enrollments/:enrollmentId/modules/:moduleId/bookmark',
  moduleProgressController.removeBookmark
);

router.get('/debug/health', (req, res) => {
  console.log(' Module Progress health check');
  res.json({
    success: true,
    message: 'Module Progress API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      getModuleProgress: 'GET /api/module-progress/enrollments/:enrollmentId/modules/:moduleId',
      updateModuleProgress: 'PUT /api/module-progress/enrollments/:enrollmentId/modules/:moduleId',
      trackContentProgress: 'POST /api/module-progress/enrollments/:enrollmentId/modules/:moduleId/track',
      markComplete: 'POST /api/module-progress/enrollments/:enrollmentId/modules/:moduleId/complete',
      getSummary: 'GET /api/module-progress/enrollments/:enrollmentId/summary',
      getOverview: 'GET /api/module-progress/overview',
      getBookmarks: 'GET /api/module-progress/bookmarks',
      bookmarkModule: 'POST /api/module-progress/enrollments/:enrollmentId/modules/:moduleId/bookmark',
      removeBookmark: 'DELETE /api/module-progress/enrollments/:enrollmentId/modules/:moduleId/bookmark'
    }
  });
});

console.log('Module Progress Router setup complete');

export default router;