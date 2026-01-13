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

console.log('🚀 Module Router initialized');

// Initialize services and controllers
const moduleService = new ModuleService();
const moduleController = new ModuleController(moduleService);
const fileUploadController = new FileUploadController(moduleService);

// Apply authentication to all module routes
router.use(authenticate);

// ==================== GET ROUTES ====================

router.get(
  '/learning-path/:learningPathId',
  moduleController.getModulesByLearningPath
);

router.get(
  '/content-type/:contentType',
  moduleController.getModulesByContentType
);

router.get(
  '/:id',
  moduleController.getModuleById
);

router.get(
  '/',
  validate(moduleQuerySchema, 'query'),
  moduleController.getAllModules
);

router.get(
  '/:id/validate',
  moduleController.validateModule
);

router.get(
  '/learning-path/:learningPathId/count',
  moduleController.getModuleCountByLearningPath
);

// ==================== FILE UPLOAD ROUTES ====================

router.post(
  '/upload/files',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  uploadMultipleFiles,
  fileUploadController.uploadFiles
);

router.post(
  '/upload/thumbnail',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  uploadSingleFile('thumbnail'),
  fileUploadController.uploadThumbnail
);

router.delete(
  '/upload/files/:publicId',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  fileUploadController.deleteFile
);

// ==================== MODULE CRUD WITH FILES ====================

router.post(
  '/with-files',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  uploadModuleFiles,
  (req, res, next) => {
    // Parse JSON fields that might be sent as strings from form-data
    try {
      if (req.body.prerequisites && typeof req.body.prerequisites === 'string') {
        req.body.prerequisites = JSON.parse(req.body.prerequisites);
      }
      if (req.body.learningObjectives && typeof req.body.learningObjectives === 'string') {
        req.body.learningObjectives = JSON.parse(req.body.learningObjectives);
      }
      if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = JSON.parse(req.body.tags);
      }
      if (req.body.resources && typeof req.body.resources === 'string') {
        req.body.resources = JSON.parse(req.body.resources);
      }
      if (req.body.attachments && typeof req.body.attachments === 'string') {
        req.body.attachments = JSON.parse(req.body.attachments);
      }
      if (req.body.keyConcepts && typeof req.body.keyConcepts === 'string') {
        req.body.keyConcepts = JSON.parse(req.body.keyConcepts);
      }
      
      // Parse number fields
      if (req.body.orderIndex && typeof req.body.orderIndex === 'string') {
        req.body.orderIndex = parseInt(req.body.orderIndex);
      }
      if (req.body.estimatedMinutes && typeof req.body.estimatedMinutes === 'string') {
        req.body.estimatedMinutes = parseInt(req.body.estimatedMinutes);
      }
      if (req.body.minEstimatedMinutes && typeof req.body.minEstimatedMinutes === 'string') {
        req.body.minEstimatedMinutes = parseInt(req.body.minEstimatedMinutes);
      }
      if (req.body.maxEstimatedMinutes && typeof req.body.maxEstimatedMinutes === 'string') {
        req.body.maxEstimatedMinutes = parseInt(req.body.maxEstimatedMinutes);
      }
      if (req.body.completionPoints && typeof req.body.completionPoints === 'string') {
        req.body.completionPoints = parseInt(req.body.completionPoints);
      }
      if (req.body.maxQuizAttempts && typeof req.body.maxQuizAttempts === 'string') {
        req.body.maxQuizAttempts = parseInt(req.body.maxQuizAttempts);
      }
      
      // Parse boolean fields
      if (req.body.isActive && typeof req.body.isActive === 'string') {
        req.body.isActive = req.body.isActive === 'true';
      }
      if (req.body.isOptional && typeof req.body.isOptional === 'string') {
        req.body.isOptional = req.body.isOptional === 'true';
      }
      if (req.body.requiresCompletion && typeof req.body.requiresCompletion === 'string') {
        req.body.requiresCompletion = req.body.requiresCompletion === 'true';
      }
    } catch (parseError) {
      console.error('❌ Error parsing form data:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in form data fields'
      });
    }
    next();
  },
  validate(createModuleSchema),
  fileUploadController.uploadModuleFiles
);

router.put(
  '/:id/with-files',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  uploadModuleFiles,
  (req, res, next) => {
    // Parse JSON fields that might be sent as strings from form-data
    try {
      if (req.body.prerequisites && typeof req.body.prerequisites === 'string') {
        req.body.prerequisites = JSON.parse(req.body.prerequisites);
      }
      if (req.body.learningObjectives && typeof req.body.learningObjectives === 'string') {
        req.body.learningObjectives = JSON.parse(req.body.learningObjectives);
      }
      if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = JSON.parse(req.body.tags);
      }
      if (req.body.resources && typeof req.body.resources === 'string') {
        req.body.resources = JSON.parse(req.body.resources);
      }
      if (req.body.attachments && typeof req.body.attachments === 'string') {
        req.body.attachments = JSON.parse(req.body.attachments);
      }
      if (req.body.keyConcepts && typeof req.body.keyConcepts === 'string') {
        req.body.keyConcepts = JSON.parse(req.body.keyConcepts);
      }
      
      // Parse number fields
      if (req.body.orderIndex && typeof req.body.orderIndex === 'string') {
        req.body.orderIndex = parseInt(req.body.orderIndex);
      }
      if (req.body.estimatedMinutes && typeof req.body.estimatedMinutes === 'string') {
        req.body.estimatedMinutes = parseInt(req.body.estimatedMinutes);
      }
      if (req.body.minEstimatedMinutes && typeof req.body.minEstimatedMinutes === 'string') {
        req.body.minEstimatedMinutes = parseInt(req.body.minEstimatedMinutes);
      }
      if (req.body.maxEstimatedMinutes && typeof req.body.maxEstimatedMinutes === 'string') {
        req.body.maxEstimatedMinutes = parseInt(req.body.maxEstimatedMinutes);
      }
      if (req.body.completionPoints && typeof req.body.completionPoints === 'string') {
        req.body.completionPoints = parseInt(req.body.completionPoints);
      }
      if (req.body.maxQuizAttempts && typeof req.body.maxQuizAttempts === 'string') {
        req.body.maxQuizAttempts = parseInt(req.body.maxQuizAttempts);
      }
      
      // Parse boolean fields
      if (req.body.isActive && typeof req.body.isActive === 'string') {
        req.body.isActive = req.body.isActive === 'true';
      }
      if (req.body.isOptional && typeof req.body.isOptional === 'string') {
        req.body.isOptional = req.body.isOptional === 'true';
      }
      if (req.body.requiresCompletion && typeof req.body.requiresCompletion === 'string') {
        req.body.requiresCompletion = req.body.requiresCompletion === 'true';
      }
    } catch (parseError) {
      console.error('❌ Error parsing form data:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in form data fields'
      });
    }
    next();
  },
  validate(updateModuleSchema),
  fileUploadController.updateModuleFiles
);

// ==================== STANDARD MODULE CRUD ====================

router.post(
  '/',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  validate(createModuleSchema),
  moduleController.createModule
);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  validate(updateModuleSchema),
  moduleController.updateModule
);

// ==================== PATCH ROUTES ====================

router.patch(
  '/:id/order',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  validate(updateModuleOrderSchema),  
  moduleController.updateModuleOrder
);

router.patch(
  '/:id/activate',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  moduleController.activateModule
);

router.patch(
  '/:id/deactivate',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  moduleController.deactivateModule
);

router.patch(
  '/:id/thumbnail',
  authorize('ADMIN', 'MANAGER', 'CONTENT_CREATOR'),
  uploadSingleFile('thumbnail'),
  fileUploadController.updateModuleThumbnail
);

// ==================== DELETE ROUTES ====================

router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  moduleController.deleteModule
);

// ==================== DEBUG/HEALTH ROUTES ====================

router.get('/debug/test', (req, res) => {
  console.log('🐛 Module debug test endpoint hit');
  res.json({
    success: true,
    message: 'Module routes are working!',
    timestamp: new Date().toISOString(),
    features: {
      fileUpload: true,
      contentTypes: ['TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK'],
      cloudinary: true,
      validation: true
    }
  });
});

router.get('/debug/uploads', (req, res) => {
  console.log('🐛 Module upload debug endpoint hit');
  res.json({
    success: true,
    message: 'Upload routes are available',
    uploadEndpoints: [
      'POST /api/v1/modules/with-files',
      'PUT /api/v1/modules/:id/with-files',
      'POST /api/v1/modules/upload/files',
      'POST /api/v1/modules/upload/thumbnail',
      'DELETE /api/v1/modules/upload/files/:publicId'
    ]
  });
});

console.log('✅ Module Router setup complete with file upload support');

export default router;