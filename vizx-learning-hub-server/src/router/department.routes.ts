import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const departmentController = new DepartmentController();

// All department routes require authentication
router.use(authenticate);

// Admin-only operations
router.post('/', authorize('ADMIN'), departmentController.createDepartment);
router.put('/:id', authorize('ADMIN'), departmentController.updateDepartment);
router.delete('/:id', authorize('ADMIN'), departmentController.deleteDepartment);

// General management/viewing (Admin and Manager)
router.get('/', authorize('ADMIN', 'MANAGER'), departmentController.getAllDepartments);
router.get('/rankings', authorize('ADMIN', 'MANAGER'), departmentController.getDepartmentRankings);
router.get('/:id', authorize('ADMIN', 'MANAGER'), departmentController.getDepartmentById);
router.get('/:id/performance', authorize('ADMIN', 'MANAGER'), departmentController.getDepartmentPerformance);

export default router;
