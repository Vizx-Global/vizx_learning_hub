import { Response } from 'express';
import { ModuleService } from '../services/module.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler';
import { ValidationError } from '../utils/error-handler';

export class FileUploadController {
  private moduleService: ModuleService;

  constructor(moduleService: ModuleService) {
    this.moduleService = moduleService;
  }

  uploadModuleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  updateModuleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
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
}