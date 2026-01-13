import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { EnrollmentService } from '../services/enrollment.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const enrollmentService = new EnrollmentService(prisma);
const enrollmentController = new EnrollmentController(enrollmentService);

router.use(authenticate);

router.post('/', enrollmentController.enrollInPath);
router.get('/', enrollmentController.getMyEnrollments);
router.get('/active-count', enrollmentController.getActiveEnrollmentsCount);

router.get('/:enrollmentId', enrollmentController.getEnrollment);
router.put('/:enrollmentId', enrollmentController.updateEnrollment);
router.delete('/:enrollmentId/drop', enrollmentController.dropEnrollment);
router.get('/:enrollmentId/progress', enrollmentController.getEnrollmentProgress);

export default router;