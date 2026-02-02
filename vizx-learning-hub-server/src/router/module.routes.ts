import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
import { FileUploadController } from '../controllers/file-upload.controller';
import { ModuleService } from '../services/module.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  createModuleSchema, 
  updateModuleSchema, 
  moduleQuerySchema,
  updateModuleOrderSchema  
} from '../validator/module.validator';
import { 
  uploadModuleFiles, 
  uploadMultipleFiles,
  uploadSingleFile 
} from '../middlewares/upload.middleware';

const router = Router();
const moduleService = new ModuleService();
const moduleController = new ModuleController(moduleService);
const fileUploadController = new FileUploadController(moduleService);

router.use(authenticate);

const parseModuleFormData = (req: any, res: any, next: any) => {
  try {
    const jsonFields = ['prerequisites', 'learningObjectives', 'tags', 'resources', 'attachments', 'keyConcepts'];
    jsonFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });

    const numberFields = ['orderIndex', 'estimatedMinutes', 'minEstimatedMinutes', 'maxEstimatedMinutes', 'completionPoints', 'maxQuizAttempts'];
    numberFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = parseInt(req.body[field]);
      }
    });

    const booleanFields = ['isActive', 'isOptional', 'requiresCompletion'];
    booleanFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field] === 'true';
      }
    });
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid form data format' });
  }
};

router.get('/learning-path/:learningPathId', moduleController.getModulesByLearningPath);
router.get('/content-type/:contentType', moduleController.getModulesByContentType);
router.get('/:id', moduleController.getModuleById);
router.get('/', validate(moduleQuerySchema, 'query'), moduleController.getAllModules);
router.get('/stats', authorize('ADMIN', 'MANAGER'), moduleController.getModuleStats);
router.get('/:id/validate', moduleController.validateModule);
router.get('/learning-path/:learningPathId/count', moduleController.getModuleCountByLearningPath);

router.post('/upload/files', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), uploadMultipleFiles, fileUploadController.uploadFiles);
router.post('/upload/thumbnail', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), uploadSingleFile('thumbnail'), fileUploadController.uploadThumbnail);
router.delete('/upload/files/:publicId', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), fileUploadController.deleteFile);

router.post('/with-files', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), uploadModuleFiles, parseModuleFormData, validate(createModuleSchema), fileUploadController.uploadModuleFiles);
router.put('/:id/with-files', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), uploadModuleFiles, parseModuleFormData, validate(updateModuleSchema), fileUploadController.updateModuleFiles);

router.post('/', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), validate(createModuleSchema), moduleController.createModule);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), validate(updateModuleSchema), moduleController.updateModule);

router.patch('/:id/order', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), validate(updateModuleOrderSchema), moduleController.updateModuleOrder);
router.patch('/:id/activate', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), moduleController.activateModule);
router.patch('/:id/deactivate', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), moduleController.deactivateModule);
router.patch('/:id/thumbnail', authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'), uploadSingleFile('thumbnail'), fileUploadController.updateModuleThumbnail);

router.delete('/:id', authorize('ADMIN', 'MANAGER'), moduleController.deleteModule);

export default router;