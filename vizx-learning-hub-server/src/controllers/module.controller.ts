import { Response } from 'express';
import { ModuleService } from '../services/module.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError, NotFoundError } from '../utils/error-handler';

export class ModuleController {
  private moduleService: ModuleService;

  constructor(moduleService: ModuleService) {
    this.moduleService = moduleService;
  }

  createModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requiredFields = ['learningPathId', 'title', 'description', 'category', 'estimatedMinutes'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const module = await this.moduleService.createModule(req.body);

    new SuccessResponse(
      'Module created successfully',
      module,
      201
    ).send(res);
  });

  getModuleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const module = await this.moduleService.getModuleById(req.params.id);

    new SuccessResponse(
      'Module retrieved successfully',
      module
    ).send(res);
  });

  getAllModules = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.moduleService.getAllModules(req.query);
    new SuccessResponse(
      'Modules retrieved successfully',
      result
    ).send(res);
  });

  updateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    if (Object.keys(req.body).length === 0) {
      throw new ValidationError('No update data provided');
    }

    const module = await this.moduleService.updateModule(req.params.id, req.body);

    new SuccessResponse(
      'Module updated successfully',
      module
    ).send(res);
  });

  deleteModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const deletedModule = await this.moduleService.deleteModule(req.params.id);

    new SuccessResponse(
      'Module deleted successfully',
      deletedModule
    ).send(res);
  });

  getModulesByLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.learningPathId) {
      throw new ValidationError('Learning path ID is required');
    }

    const modules = await this.moduleService.getModulesByLearningPath(req.params.learningPathId);

    new SuccessResponse(
      'Modules by learning path retrieved successfully',
      modules
    ).send(res);
  });

  updateModuleOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const { orderIndex } = req.body;
    
    if (orderIndex === undefined || orderIndex === null) {
      throw new ValidationError('Order index is required');
    }

    if (typeof orderIndex !== 'number' || orderIndex < 0) {
      throw new ValidationError('Order index must be a non-negative number');
    }

    const module = await this.moduleService.updateModuleOrder(req.params.id, orderIndex);

    new SuccessResponse(
      'Module order updated successfully',
      module
    ).send(res);
  });

  activateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const module = await this.moduleService.activateModule(req.params.id);

    new SuccessResponse(
      'Module activated successfully',
      module
    ).send(res);
  });

  deactivateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const module = await this.moduleService.deactivateModule(req.params.id);

    new SuccessResponse(
      'Module deactivated successfully',
      module
    ).send(res);
  });

  getModuleCountByLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.learningPathId) {
      throw new ValidationError('Learning path ID is required');
    }

    const count = await this.moduleService.getModuleCountByLearningPath(req.params.learningPathId);

    new SuccessResponse(
      'Module count retrieved successfully',
      { count, learningPathId: req.params.learningPathId }
    ).send(res);
  });

  validateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    const exists = await this.moduleService.validateModuleExists(req.params.id);

    new SuccessResponse(
      'Module validation completed',
      { exists, moduleId: req.params.id }
    ).send(res);
  });

  getModuleStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.moduleService.getModuleStats();
    new SuccessResponse(
      'Module statistics retrieved successfully',
      stats
    ).send(res);
  });

  getModulesByContentType = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { contentType } = req.params;
    const { learningPathId } = req.query;

    if (!contentType) {
      throw new ValidationError('Content type is required');
    }

    const modules = await this.moduleService.getModulesByContentType(
      contentType as any,
      learningPathId as string
    );

    new SuccessResponse(
      `${contentType} modules retrieved successfully`,
      modules
    ).send(res);
  });

  createModuleWithFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requiredFields = ['learningPathId', 'title', 'description', 'category', 'estimatedMinutes'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const files = req.files as any;
    const moduleData = req.body;
    const module = await this.moduleService.createModuleWithFiles(moduleData, files);

    new SuccessResponse(
      'Module created with files successfully',
      module,
      201
    ).send(res);
  });

  updateModuleWithFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    if (Object.keys(req.body).length === 0 && (!req.files || Object.keys(req.files).length === 0)) {
      throw new ValidationError('No update data or files provided');
    }

    const files = req.files as any;
    const updateData = req.body;
    const module = await this.moduleService.updateModuleWithFiles(req.params.id, updateData, files);

    new SuccessResponse(
      'Module updated with files successfully',
      module
    ).send(res);
  });

  uploadFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      throw new ValidationError('No files uploaded');
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    const folder = req.body.folder || 'learning-hub';
    const results = await this.moduleService.uploadFiles(files, folder);

    new SuccessResponse(
      'Files uploaded successfully',
      results
    ).send(res);
  });

  deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.publicId) {
      throw new ValidationError('File public ID is required');
    }

    const { publicId } = req.params;
    const { resourceType = 'image' } = req.body;

    await this.moduleService.deleteFile(publicId, resourceType);

    new SuccessResponse(
      'File deleted successfully'
    ).send(res);
  });

  uploadThumbnail = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No thumbnail file uploaded');
    }

    const folder = req.body.folder || 'learning-hub/thumbnails';
    const result = await this.moduleService.uploadThumbnail(req.file, folder);

    new SuccessResponse(
      'Thumbnail uploaded successfully',
      result
    ).send(res);
  });

  updateModuleThumbnail = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.params.id) {
      throw new ValidationError('Module ID is required');
    }

    if (!req.file) {
      throw new ValidationError('No thumbnail file provided');
    }

    const module = await this.moduleService.updateModuleThumbnail(req.params.id, req.file);

    new SuccessResponse(
      'Module thumbnail updated successfully',
      module
    ).send(res);
  });

  bulkUpdateModuleOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      throw new ValidationError('Updates array is required');
    }

    for (const update of updates) {
      if (!update.id || update.orderIndex === undefined || update.orderIndex === null) {
        throw new ValidationError('Each update must contain id and orderIndex');
      }
    }

    const results = await this.moduleService.bulkUpdateModuleOrder(updates);

    new SuccessResponse(
      'Module orders updated successfully',
      results
    ).send(res);
  });

  healthCheck = asyncHandler(async (req: AuthRequest, res: Response) => {
    const healthInfo = await this.moduleService.healthCheck();
    new SuccessResponse(
      'Module service is healthy',
      healthInfo
    ).send(res);
  });

  getLearningPathModulesByContentType = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { learningPathId, contentType } = req.params;

    if (!learningPathId) {
      throw new ValidationError('Learning path ID is required');
    }

    if (!contentType) {
      throw new ValidationError('Content type is required');
    }

    const modules = await this.moduleService.getModulesByContentType(
      contentType as any,
      learningPathId
    );

    new SuccessResponse(
      `${contentType} modules for learning path retrieved successfully`,
      modules
    ).send(res);
  });
}