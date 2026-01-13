// src/controllers/file-upload.controller.ts
import { Request, Response } from 'express';
import { ModuleService } from '../services/module.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/assyncHandler';
import { ValidationError, DatabaseError, NotFoundError } from '../utils/error-handler';

export class FileUploadController {
  private moduleService: ModuleService;

  constructor(moduleService: ModuleService) {
    this.moduleService = moduleService;
  }

  uploadModuleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('🎯 FileUploadController: Creating module with file uploads');
    
    try {
      // Validate required fields
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

      const module = await this.moduleService.createModuleWithFiles(moduleData, files);

      new SuccessResponse(
        'Module created with files successfully',
        module,
        201
      ).send(res);
    } catch (error) {
      console.error('❌ FileUploadController: Error creating module with files:', error);
      
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

  updateModuleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('🎯 FileUploadController: Updating module with file uploads:', req.params.id);
    
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

      const module = await this.moduleService.updateModuleWithFiles(req.params.id, updateData, files);

      new SuccessResponse(
        'Module updated with files successfully',
        module
      ).send(res);
    } catch (error) {
      console.error('❌ FileUploadController: Error updating module with files:', error);
      
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
    console.log('🎯 FileUploadController: Uploading files');
    
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const folder = req.body.folder || 'learning-hub';

      const results = await this.moduleService.uploadFiles(files, folder);

      new SuccessResponse(
        'Files uploaded successfully',
        results
      ).send(res);
    } catch (error) {
      console.error('❌ FileUploadController: Error uploading files:', error);
      
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
    console.log('🎯 FileUploadController: Deleting file:', req.params.publicId);
    
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
      console.error('❌ FileUploadController: Error deleting file:', error);
      
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
    console.log('🎯 FileUploadController: Uploading thumbnail');
    
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
      console.error('❌ FileUploadController: Error uploading thumbnail:', error);
      
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
    console.log('🎯 FileUploadController: Updating module thumbnail:', req.params.id);
    
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
      console.error('❌ FileUploadController: Error updating module thumbnail:', error);
      
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
}