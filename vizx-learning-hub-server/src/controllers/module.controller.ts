import { Request, Response } from 'express';
import { ModuleService } from '../services/module.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/assyncHandler';
import { ValidationError, DatabaseError, NotFoundError } from '../utils/error-handler';

export class ModuleController {
  private moduleService: ModuleService;

  constructor(moduleService: ModuleService) {
    this.moduleService = moduleService;
  }
  createModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Creating module with body:', {
      ...req.body,
      content: req.body.content ? `${req.body.content.substring(0, 100)}...` : null
    });
    
    try {
      const requiredFields = ['learningPathId', 'title', 'description', 'category', 'estimatedMinutes'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const module = await this.moduleService.createModule(req.body);

      new SuccessResponse(
        'Module created successfully',
        module,
        201
      ).send(res);
    } catch (error) {
      console.error('Controller: Error creating module:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  getModuleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting module by ID:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const module = await this.moduleService.getModuleById(req.params.id);

      new SuccessResponse(
        'Module retrieved successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting module by ID:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  getAllModules = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting all modules with query:', req.query);
    
    try {
      const result = await this.moduleService.getAllModules(req.query);

      new SuccessResponse(
        'Modules retrieved successfully',
        result
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting all modules:', error);
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  updateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Updating module:', req.params.id, 'with body:', {
      ...req.body,
      content: req.body.content ? `${req.body.content.substring(0, 100)}...` : null
    });
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No update data provided'
        });
      }

      const module = await this.moduleService.updateModule(req.params.id, req.body);

      new SuccessResponse(
        'Module updated successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error updating module:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  deleteModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Deleting module:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const deletedModule = await this.moduleService.deleteModule(req.params.id);

      new SuccessResponse(
        'Module deleted successfully',
        deletedModule
      ).send(res);
    } catch (error) {
      console.error('Controller: Error deleting module:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  getModulesByLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting modules by learning path:', req.params.learningPathId);
    
    try {
      if (!req.params.learningPathId) {
        return res.status(400).json({
          success: false,
          message: 'Learning path ID is required'
        });
      }

      const modules = await this.moduleService.getModulesByLearningPath(req.params.learningPathId);

      new SuccessResponse(
        'Modules by learning path retrieved successfully',
        modules
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting modules by learning path:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  updateModuleOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Updating module order:', req.params.id, 'to:', req.body.orderIndex);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const { orderIndex } = req.body;
      
      if (orderIndex === undefined || orderIndex === null) {
        return res.status(400).json({
          success: false,
          message: 'Order index is required'
        });
      }

      if (typeof orderIndex !== 'number' || orderIndex < 0) {
        return res.status(400).json({
          success: false,
          message: 'Order index must be a non-negative number'
        });
      }

      const module = await this.moduleService.updateModuleOrder(req.params.id, orderIndex);

      new SuccessResponse(
        'Module order updated successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error updating module order:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  activateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Activating module:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const module = await this.moduleService.activateModule(req.params.id);

      new SuccessResponse(
        'Module activated successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error activating module:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  deactivateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Deactivating module:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const module = await this.moduleService.deactivateModule(req.params.id);

      new SuccessResponse(
        'Module deactivated successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error deactivating module:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  getModuleCountByLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting module count for learning path:', req.params.learningPathId);
    
    try {
      if (!req.params.learningPathId) {
        return res.status(400).json({
          success: false,
          message: 'Learning path ID is required'
        });
      }

      const count = await this.moduleService.getModuleCountByLearningPath(req.params.learningPathId);

      new SuccessResponse(
        'Module count retrieved successfully',
        { count, learningPathId: req.params.learningPathId }
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting module count:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  validateModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Validating module exists:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const exists = await this.moduleService.validateModuleExists(req.params.id);

      new SuccessResponse(
        'Module validation completed',
        { exists, moduleId: req.params.id }
      ).send(res);
    } catch (error) {
      console.error('Controller: Error validating module:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error validating module existence'
      });
    }
  });
  getModulesByContentType = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting modules by content type:', req.params.contentType);
    
    try {
      const { contentType } = req.params;
      const { learningPathId } = req.query;

      if (!contentType) {
        return res.status(400).json({
          success: false,
          message: 'Content type is required'
        });
      }

      const modules = await this.moduleService.getModulesByContentType(
        contentType as any,
        learningPathId as string
      );

      new SuccessResponse(
        `${contentType} modules retrieved successfully`,
        modules
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting modules by content type:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  createModuleWithFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Creating module with file uploads');
    
    try {
      const requiredFields = ['learningPathId', 'title', 'description', 'category', 'estimatedMinutes'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const files = req.files as any;
      const moduleData = req.body;
      console.log('Controller: Processing files for module creation:', {
        video: files.video?.length || 0,
        audio: files.audio?.length || 0,
        document: files.document?.length || 0,
        thumbnail: files.thumbnail?.length || 0,
        attachments: files.attachments?.length || 0,
        contentType: moduleData.contentType
      });

      const module = await this.moduleService.createModuleWithFiles(moduleData, files);

      new SuccessResponse(
        'Module created with files successfully',
        module,
        201
      ).send(res);
    } catch (error) {
      console.error('Controller: Error creating module with files:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  updateModuleWithFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Updating module with file uploads:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      if (Object.keys(req.body).length === 0 && (!req.files || Object.keys(req.files).length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'No update data or files provided'
        });
      }

      const files = req.files as any;
      const updateData = req.body;

      console.log('Controller: Processing files for module update:', {
        video: files.video?.length || 0,
        audio: files.audio?.length || 0,
        document: files.document?.length || 0,
        thumbnail: files.thumbnail?.length || 0,
        attachments: files.attachments?.length || 0,
        contentType: updateData.contentType
      });

      const module = await this.moduleService.updateModuleWithFiles(req.params.id, updateData, files);

      new SuccessResponse(
        'Module updated with files successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error updating module with files:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  uploadFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Uploading files');
    
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const folder = req.body.folder || 'learning-hub';

      console.log(`Controller: Uploading ${files.length} files to folder: ${folder}`);

      const results = await this.moduleService.uploadFiles(files, folder);

      new SuccessResponse(
        'Files uploaded successfully',
        results
      ).send(res);
    } catch (error) {
      console.error('Controller: Error uploading files:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Deleting file:', req.params.publicId);
    
    try {
      if (!req.params.publicId) {
        return res.status(400).json({
          success: false,
          message: 'File public ID is required'
        });
      }

      const { publicId } = req.params;
      const { resourceType = 'image' } = req.body;

      await this.moduleService.deleteFile(publicId, resourceType);

      new SuccessResponse(
        'File deleted successfully'
      ).send(res);
    } catch (error) {
      console.error('Controller: Error deleting file:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  uploadThumbnail = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Uploading thumbnail');
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No thumbnail file uploaded'
        });
      }

      const folder = req.body.folder || 'learning-hub/thumbnails';
      const result = await this.moduleService.uploadThumbnail(req.file, folder);

      new SuccessResponse(
        'Thumbnail uploaded successfully',
        result
      ).send(res);
    } catch (error) {
      console.error('Controller: Error uploading thumbnail:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  updateModuleThumbnail = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Updating module thumbnail:', req.params.id);
    
    try {
      if (!req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No thumbnail file provided'
        });
      }

      const module = await this.moduleService.updateModuleThumbnail(req.params.id, req.file);

      new SuccessResponse(
        'Module thumbnail updated successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('Controller: Error updating module thumbnail:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  bulkUpdateModuleOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Bulk updating module orders for', req.body.updates?.length, 'modules');
    
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required with module IDs and order indices'
        });
      }
      for (const update of updates) {
        if (!update.id || update.orderIndex === undefined || update.orderIndex === null) {
          return res.status(400).json({
            success: false,
            message: 'Each update must contain id and orderIndex'
          });
        }
        if (typeof update.orderIndex !== 'number' || update.orderIndex < 0) {
          return res.status(400).json({
            success: false,
            message: 'Order index must be a non-negative number'
          });
        }
      }

      console.log(`Controller: Bulk updating ${updates.length} module orders`);

      const results = await this.moduleService.bulkUpdateModuleOrder(updates);

      new SuccessResponse(
        'Module orders updated successfully',
        results
      ).send(res);
    } catch (error) {
      console.error('Controller: Error bulk updating module orders:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
  healthCheck = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Module health check');
    
    try {
      const healthInfo = await this.moduleService.healthCheck();

      new SuccessResponse(
        'Module service is healthy',
        healthInfo
      ).send(res);
    } catch (error) {
      console.error('Controller: Error in health check:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Module service health check failed',
        error: error.message
      });
    }
  });

  /**
   * Get modules with specific content type for a learning path
   */
  getLearningPathModulesByContentType = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting modules by content type for learning path:', {
      learningPathId: req.params.learningPathId,
      contentType: req.params.contentType
    });
    
    try {
      const { learningPathId, contentType } = req.params;

      if (!learningPathId) {
        return res.status(400).json({
          success: false,
          message: 'Learning path ID is required'
        });
      }

      if (!contentType) {
        return res.status(400).json({
          success: false,
          message: 'Content type is required'
        });
      }

      const modules = await this.moduleService.getModulesByContentType(
        contentType as any,
        learningPathId
      );

      new SuccessResponse(
        `${contentType} modules for learning path retrieved successfully`,
        modules
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting learning path modules by content type:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
}