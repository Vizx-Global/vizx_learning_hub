import { Router } from 'express';
import { ModuleProgressController } from '../controllers/module-progress.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { ModuleProgressService } from '../services/module-progress.service';
import { validate } from '../middlewares/validation.middleware';
import { moduleProgressValidators } from '../validator/module-progress.validator';
import prisma from '../database';

const router = Router();
const moduleProgressService = new ModuleProgressService(prisma);
const moduleProgressController = new ModuleProgressController(moduleProgressService);

router.use(authenticate);

router.get('/enrollments/:enrollmentId/modules/:moduleId', moduleProgressController.getModuleProgress);
router.get('/modules/:moduleId', moduleProgressController.getModuleProgressByModuleId);
router.put('/enrollments/:enrollmentId/modules/:moduleId', validate(moduleProgressValidators.updateModuleProgressSchema), moduleProgressController.updateModuleProgress);
router.post('/enrollments/:enrollmentId/modules/:moduleId/track', validate(moduleProgressValidators.contentProgressSchema), moduleProgressController.trackContentProgress);
router.post('/enrollments/:enrollmentId/modules/:moduleId/complete', validate(moduleProgressValidators.markModuleCompleteSchema), moduleProgressController.markModuleComplete);
router.get('/enrollments/:enrollmentId/summary', moduleProgressController.getProgressSummary);
router.get('/overview', moduleProgressController.getUserProgressOverview);
router.get('/bookmarks', validate(moduleProgressValidators.queryModuleProgressSchema, 'query'), moduleProgressController.getBookmarkedModules);
router.post('/enrollments/:enrollmentId/modules/:moduleId/bookmark', moduleProgressController.bookmarkModule);
router.delete('/enrollments/:enrollmentId/modules/:moduleId/bookmark', moduleProgressController.removeBookmark);

export default router;