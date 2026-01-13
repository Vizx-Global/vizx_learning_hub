import { ModuleRepository } from '../repositories/module.repository';
import { LearningPathRepository } from '../repositories/learningPath.repository';
import { 
  Module, 
  ContentType, 
  DifficultyLevel, 
  Prisma,
  type ModuleWithLearningPath 
} from '@prisma/client';
import { 
  NotFoundError, 
  ValidationError, 
  DatabaseError,
  ConflictError 
} from '../utils/error-handler';
import { FileUploadService, UploadResult } from './file-upload.service';
import path from 'path';

export interface CreateModuleData {
  learningPathId: string;
  title: string;
  description: string;
  shortDescription?: string;
  orderIndex?: number;
  content?: string | null;
  contentType?: ContentType;
  category: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes: number;
  minEstimatedMinutes?: number;
  maxEstimatedMinutes?: number;

  videoUrl?: string;
  audioUrl?: string;
  documentUrl?: string;
  externalLink?: string;
  
  thumbnailUrl?: string;
  resources?: string[];
  attachments?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  keyConcepts?: string[];
  isActive?: boolean;
  isOptional?: boolean;
  requiresCompletion?: boolean;
  completionPoints?: number;
  maxQuizAttempts?: number;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  shortDescription?: string | null;
  orderIndex?: number;
  content?: string | null;
  contentType?: ContentType;
  category?: string;
  difficulty?: DifficultyLevel;
  estimatedMinutes?: number;
  minEstimatedMinutes?: number;
  maxEstimatedMinutes?: number;

  videoUrl?: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  externalLink?: string | null;
  
  thumbnailUrl?: string | null;
  resources?: string[];
  attachments?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  keyConcepts?: string[];
  isActive?: boolean;
  isOptional?: boolean;
  requiresCompletion?: boolean;
  completionPoints?: number;
  maxQuizAttempts?: number;
}

export interface FileUploads {
  thumbnail?: Express.Multer.File[];
  video?: Express.Multer.File[];
  audio?: Express.Multer.File[];
  document?: Express.Multer.File[];
  attachments?: Express.Multer.File[];
}

export interface BulkOrderUpdate {
  id: string;
  orderIndex: number;
}

export interface ModuleQueryParams {
  page?: number;
  limit?: number;
  learningPathId?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  search?: string;
  contentType?: ContentType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ModuleService {
  private static readonly VALID_CONTENT_TYPES = Object.values(ContentType);
  private static readonly VALID_DIFFICULTY_LEVELS = Object.values(DifficultyLevel);

  constructor() {}
  async createModule(data: CreateModuleData): Promise<Module> {
    try {
      console.log('🔧 Service: Creating module with data:', {
        title: data.title,
        learningPathId: data.learningPathId,
        contentType: data.contentType,
        hasContent: !!data.content,
        hasVideoUrl: !!data.videoUrl,
        hasAudioUrl: !!data.audioUrl,
        hasDocumentUrl: !!data.documentUrl,
        hasExternalLink: !!data.externalLink
      });
      this.validateCreateModuleData(data);
      await this.validateLearningPathExists(data.learningPathId);
      this.validateContentTypeSpecificFields(data, false);
      const processedData = this.processContentForCreation(data);
      const moduleData: Prisma.ModuleCreateInput = {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        orderIndex: data.orderIndex,
        contentType: data.contentType || ContentType.TEXT,
        category: data.category,
        difficulty: data.difficulty || DifficultyLevel.BEGINNER,
        estimatedMinutes: data.estimatedMinutes,
        minEstimatedMinutes: data.minEstimatedMinutes,
        maxEstimatedMinutes: data.maxEstimatedMinutes,
        videoUrl: processedData.videoUrl,
        audioUrl: processedData.audioUrl,
        documentUrl: processedData.documentUrl,
        externalLink: processedData.externalLink,
        content: processedData.content,
        thumbnailUrl: data.thumbnailUrl,
        resources: data.resources || [],
        attachments: data.attachments || [],
        prerequisites: data.prerequisites || [],
        learningObjectives: data.learningObjectives || [],
        tags: data.tags || [],
        keyConcepts: data.keyConcepts || [],
        isActive: data.isActive ?? true,
        isOptional: data.isOptional ?? false,
        requiresCompletion: data.requiresCompletion ?? true,
        completionPoints: data.completionPoints || 100,
        maxQuizAttempts: data.maxQuizAttempts,
        learningPath: {
          connect: { id: data.learningPathId }
        }
      };

      const module = await ModuleRepository.create(moduleData);
      console.log('Service: Module created successfully:', module.id);
      
      return module;
    } catch (error) {
      console.error('Service: Error creating module:', error);
      
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to create module', error);
    }
  }
  async createModuleWithFiles(
    data: CreateModuleData,
    files: FileUploads = {}
  ): Promise<Module> {
    let uploadResults: (UploadResult | UploadResult[])[] = [];

    try {
      console.log('Service: Creating module with files');
      console.log('Files provided:', {
        video: files.video?.length || 0,
        audio: files.audio?.length || 0,
        document: files.document?.length || 0,
        thumbnail: files.thumbnail?.length || 0,
        attachments: files.attachments?.length || 0
      });
      this.validateCreateModuleData(data);
      await this.validateLearningPathExists(data.learningPathId);
      const hasContentFile = !!(
        files.video?.length || 
        files.audio?.length || 
        files.document?.length
      );

      console.log(' Has content file:', hasContentFile);

      this.validateContentTypeSpecificFields(data, hasContentFile);

      const uploadData = await this.handleFileUploads(data, files);
      uploadResults = uploadData.uploadResults;

      console.log(' Files uploaded successfully:', uploadData.fileUrls);
      const enhancedData: CreateModuleData = {
        ...data,
        ...uploadData.fileUrls
      };

      return await this.createModule(enhancedData);
    } catch (error) {
      console.error('Service: Error creating module with files:', error);
      if (uploadResults.length > 0) {
        await this.cleanupFailedUploads(uploadResults);
      }
      
      throw error;
    }
  }
  async getModuleById(id: string): Promise<ModuleWithLearningPath> {
    try {
      console.log('Service: Getting module by ID:', id);

      if (!id) {
        throw new ValidationError('Module ID is required');
      }

      const module = await ModuleRepository.findById(id);
      
      if (!module) {
        throw new NotFoundError('Module not found');
      }

      console.log('Service: Module retrieved successfully');
      return module;
    } catch (error) {
      console.error(' Service: Error getting module by ID:', error);
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to get module', error);
    }
  }
  async getAllModules(query: ModuleQueryParams = {}) {
    try {
      console.log('Service: Getting all modules with query:', query);
      const filters = this.buildFilters(query);
      
      const pagination = this.buildPagination(query);

      const result = await ModuleRepository.findAll(filters, pagination);

      console.log(`Service: Retrieved ${result.modules.length} modules out of ${result.total} total`);
      return result;
    } catch (error) {
      console.error('Service: Error getting all modules:', error);
      throw new DatabaseError('Failed to get modules', error);
    }
  }

  async updateModule(id: string, data: UpdateModuleData): Promise<ModuleWithLearningPath> {
    try {
      console.log(' Service: Updating module:', id, 'with data:', data);
      const existingModule = await this.getModuleById(id);
      this.validateUpdateModuleData(data, existingModule);
      const processedData = this.processContentForUpdate(data, existingModule);

      const updateData: Prisma.ModuleUpdateInput = {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.contentType && { contentType: data.contentType }),
        ...(data.category && { category: data.category }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
        ...(data.minEstimatedMinutes !== undefined && { minEstimatedMinutes: data.minEstimatedMinutes }),
        ...(data.maxEstimatedMinutes !== undefined && { maxEstimatedMinutes: data.maxEstimatedMinutes }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.documentUrl !== undefined && { documentUrl: data.documentUrl }),
        ...(data.externalLink !== undefined && { externalLink: data.externalLink }),
        ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
        ...(data.resources !== undefined && { resources: data.resources }),
        ...(data.attachments !== undefined && { attachments: data.attachments }),
        ...(data.prerequisites !== undefined && { prerequisites: data.prerequisites }),
        ...(data.learningObjectives !== undefined && { learningObjectives: data.learningObjectives }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.keyConcepts !== undefined && { keyConcepts: data.keyConcepts }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isOptional !== undefined && { isOptional: data.isOptional }),
        ...(data.requiresCompletion !== undefined && { requiresCompletion: data.requiresCompletion }),
        ...(data.completionPoints !== undefined && { completionPoints: data.completionPoints }),
        ...(data.maxQuizAttempts !== undefined && { maxQuizAttempts: data.maxQuizAttempts }),
        ...processedData.contentUpdate
      };

      const updatedModule = await ModuleRepository.update(id, updateData);
      console.log('Service: Module updated successfully');
      
      return updatedModule;
    } catch (error) {
      console.error(' Service: Error updating module:', error);
      
      if (error instanceof NotFoundError || error instanceof DatabaseError || error instanceof ValidationError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to update module', error);
    }
  }
  async updateModuleWithFiles(
    id: string,
    data: UpdateModuleData,
    files: FileUploads = {}
  ): Promise<ModuleWithLearningPath> {
    let uploadResults: (UploadResult | UploadResult[])[] = [];
    let filesToDelete: string[] = [];

    try {
      console.log('Service: Updating module with files:', id);

      const existingModule = await this.getModuleById(id);
      const uploadData = await this.handleFileUploadsForUpdate(data, files, existingModule);
      uploadResults = uploadData.uploadResults;
      filesToDelete = uploadData.filesToDelete;
      const enhancedData: UpdateModuleData = {
        ...data,
        ...uploadData.fileUrls
      };

      const updatedModule = await this.updateModule(id, enhancedData);

      if (filesToDelete.length > 0) {
        await this.deleteFiles(filesToDelete);
      }

      return updatedModule;
    } catch (error) {
      console.error(' Service: Error updating module with files:', error);
      if (uploadResults.length > 0) {
        await this.cleanupFailedUploads(uploadResults);
      }
      
      throw error;
    }
  }

  async deleteModule(id: string): Promise<Module> {
    try {
      console.log(' Service: Deleting module:', id);
      
      const module = await this.getModuleById(id);

      const deletedModule = await ModuleRepository.delete(id);
      await this.cleanupModuleFiles(module);
      
      console.log('Service: Module deleted successfully');
      return deletedModule;
    } catch (error) {
      console.error('Service: Error deleting module:', error);
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to delete module', error);
    }
  }

  async getModulesByLearningPath(learningPathId: string): Promise<ModuleWithLearningPath[]> {
    try {
      console.log('Service: Getting modules by learning path:', learningPathId);
      await this.validateLearningPathExists(learningPathId);

      const modules = await ModuleRepository.findByLearningPathId(learningPathId);
      console.log(`Service: Retrieved ${modules.length} modules for learning path`);
      
      return modules;
    } catch (error) {
      console.error('Service: Error getting modules by learning path:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to get modules by learning path', error);
    }
  }
  async updateModuleOrder(id: string, orderIndex: number): Promise<Module> {
    try {
      console.log('Service: Updating module order:', id, 'to:', orderIndex);
      await this.getModuleById(id);
      if (orderIndex < 0) {
        throw new ValidationError('Order index must be non-negative');
      }

      const updatedModule = await ModuleRepository.updateOrderIndex(id, orderIndex);
      console.log('Service: Module order updated successfully');
      
      return updatedModule;
    } catch (error) {
      console.error('Service: Error updating module order:', error);
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to update module order', error);
    }
  }
  async bulkUpdateModuleOrder(updates: BulkOrderUpdate[]): Promise<Module[]> {
    try {
      console.log('Service: Bulk updating module orders for', updates.length, 'modules');
            for (const update of updates) {
        if (update.orderIndex < 0) {
          throw new ValidationError(`Order index must be non-negative for module ${update.id}`);
        }
      }

      const results = await ModuleRepository.bulkUpdateOrders(updates);
      console.log('Service: Bulk module order update completed');
      
      return results;
    } catch (error) {
      console.error('Service: Error in bulk update module order:', error);
      throw new DatabaseError('Failed to bulk update module orders', error);
    }
  }
  async getModulesByContentType(contentType: ContentType, learningPathId?: string): Promise<ModuleWithLearningPath[]> {
    try {
      console.log(`Service: Getting ${contentType} modules`, learningPathId ? `for learning path: ${learningPathId}` : '');

      if (!ModuleService.VALID_CONTENT_TYPES.includes(contentType)) {
        throw new ValidationError(`Invalid content type: ${contentType}`);
      }

      if (learningPathId) {
        await this.validateLearningPathExists(learningPathId);
      }

      const modules = await ModuleRepository.findByContentType(contentType, learningPathId);
      console.log(`Service: Retrieved ${modules.length} ${contentType} modules`);
      return modules;
    } catch (error) {
      console.error(`Service: Error getting ${contentType} modules:`, error);
      throw new DatabaseError(`Failed to get ${contentType} modules`, error);
    }
  }
  async activateModule(id: string): Promise<ModuleWithLearningPath> {
    try {
      console.log('Service: Activating module:', id);
      return await this.updateModule(id, { isActive: true });
    } catch (error) {
      console.error('Service: Error activating module:', error);
      throw error;
    }
  }
  async deactivateModule(id: string): Promise<ModuleWithLearningPath> {
    try {
      console.log('Service: Deactivating module:', id);
      return await this.updateModule(id, { isActive: false });
    } catch (error) {
      console.error('Service: Error deactivating module:', error);
      throw error;
    }
  }
  async getModuleCountByLearningPath(learningPathId: string): Promise<number> {
    try {
      console.log('Service: Getting module count for learning path:', learningPathId);
      
      await this.validateLearningPathExists(learningPathId);

      const count = await ModuleRepository.countByLearningPathId(learningPathId);
      console.log(`Service: Module count: ${count}`);
      
      return count;
    } catch (error) {
      console.error('Service: Error getting module count:', error);
      throw new DatabaseError('Failed to get module count', error);
    }
  }
  async validateModuleExists(id: string): Promise<boolean> {
    try {
      const module = await ModuleRepository.findById(id);
      return !!module;
    } catch (error) {
      console.error(' Service: Error validating module existence:', error);
      return false;
    }
  }
  async uploadFiles(files: Express.Multer.File[], folder: string = 'modules'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      FileUploadService.uploadFile(file.buffer, file.originalname, folder)
    );
    return await Promise.all(uploadPromises);
  }

  async uploadThumbnail(file: Express.Multer.File, folder: string = 'modules/thumbnails'): Promise<UploadResult> {
    return await FileUploadService.uploadFile(file.buffer, file.originalname, folder, 'image');
  }

  async updateModuleThumbnail(id: string, file: Express.Multer.File): Promise<ModuleWithLearningPath> {
    const module = await this.getModuleById(id);
    const folder = `modules/thumbnails`;
    
    const result = await FileUploadService.uploadFile(file.buffer, file.originalname, folder, 'image');
    
    if (module.thumbnailUrl) {
      const fileName = this.extractFileName(module.thumbnailUrl);
      if (fileName) {
        try {
          await FileUploadService.deleteFile(fileName);
        } catch (error) {
          console.warn('Could not delete old thumbnail:', error.message);
        }
      }
    }
    
    return await this.updateModule(id, { thumbnailUrl: result.url });
  }

  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    await FileUploadService.deleteFile(publicId, resourceType);
  }
  private validateCreateModuleData(data: CreateModuleData): void {
    if (!data.title?.trim()) {
      throw new ValidationError('Module title is required');
    }

    if (!data.learningPathId) {
      throw new ValidationError('Learning path ID is required');
    }

    if (!data.category?.trim()) {
      throw new ValidationError('Category is required');
    }

    if (data.estimatedMinutes <= 0) {
      throw new ValidationError('Estimated minutes must be positive');
    }

    if (data.contentType && !ModuleService.VALID_CONTENT_TYPES.includes(data.contentType)) {
      throw new ValidationError(`Invalid content type: ${data.contentType}`);
    }

    if (data.difficulty && !ModuleService.VALID_DIFFICULTY_LEVELS.includes(data.difficulty)) {
      throw new ValidationError(`Invalid difficulty level: ${data.difficulty}`);
    }
  }
  private validateUpdateModuleData(data: UpdateModuleData, existingModule: ModuleWithLearningPath): void {
    if (data.title !== undefined && !data.title.trim()) {
      throw new ValidationError('Module title cannot be empty');
    }

    if (data.estimatedMinutes !== undefined && data.estimatedMinutes <= 0) {
      throw new ValidationError('Estimated minutes must be positive');
    }

    if (data.contentType && !ModuleService.VALID_CONTENT_TYPES.includes(data.contentType)) {
      throw new ValidationError(`Invalid content type: ${data.contentType}`);
    }

    if (data.difficulty && !ModuleService.VALID_DIFFICULTY_LEVELS.includes(data.difficulty)) {
      throw new ValidationError(`Invalid difficulty level: ${data.difficulty}`);
    }

    if (data.contentType && data.contentType !== existingModule.contentType) {
      const validationData: CreateModuleData = {
        ...existingModule,
        ...data,
        learningPathId: existingModule.learningPathId
      } as CreateModuleData;
      this.validateContentTypeSpecificFields(validationData, false);
    }
  }

  /**
   * Validate content type specific requirements
   * @param data - Module data to validate
   * @param hasFiles - Whether files are being uploaded with the request
   */
  private validateContentTypeSpecificFields(data: CreateModuleData, hasFiles: boolean = false): void {
    const contentType = data.contentType || ContentType.TEXT;

    console.log('Validating content type:', contentType, '| Has files:', hasFiles);

    switch (contentType) {
      case ContentType.TEXT:
        if (!data.content || data.content.trim() === '') {
          throw new ValidationError('Text content is required for TEXT content type and cannot be empty');
        }
        console.log('TEXT validation passed');
        break;

      case ContentType.VIDEO:
        const hasVideoUrl = data.videoUrl && data.videoUrl.trim() !== '';
        if (!hasVideoUrl && !hasFiles) {
          throw new ValidationError('Video URL or video file upload is required for VIDEO content type');
        }
        console.log('VIDEO validation passed', { hasVideoUrl, hasFiles });
        break;

      case ContentType.AUDIO:
        const hasAudioUrl = data.audioUrl && data.audioUrl.trim() !== '';
        if (!hasAudioUrl && !hasFiles) {
          throw new ValidationError('Audio URL or audio file upload is required for AUDIO content type');
        }
        console.log('AUDIO validation passed', { hasAudioUrl, hasFiles });
        break;

      case ContentType.DOCUMENT:
        const hasDocumentUrl = data.documentUrl && data.documentUrl.trim() !== '';
        if (!hasDocumentUrl && !hasFiles) {
          throw new ValidationError('Document URL or document file upload is required for DOCUMENT content type');
        }
        console.log('DOCUMENT validation passed', { hasDocumentUrl, hasFiles });
        break;

      case ContentType.EXTERNAL_LINK:
        if (!data.externalLink || data.externalLink.trim() === '') {
          throw new ValidationError('External link URL is required for EXTERNAL_LINK content type');
        }
        console.log('EXTERNAL_LINK validation passed');
        break;

      case ContentType.QUIZ:
      case ContentType.ASSESSMENT:
        if (!data.maxQuizAttempts && data.maxQuizAttempts !== 0) {
          throw new ValidationError('Max quiz attempts is required for QUIZ/ASSESSMENT content type');
        }
        console.log('QUIZ/ASSESSMENT validation passed');
        break;

      case ContentType.INTERACTIVE:
        console.log('INTERACTIVE validation passed (flexible)');
        break;
    }
  }
  private processContentForCreation(data: CreateModuleData): {
    content: string | null;
    videoUrl?: string;
    audioUrl?: string;
    documentUrl?: string;
    externalLink?: string;
  } {
    const contentType = data.contentType || ContentType.TEXT;
    const result: any = {};
    switch (contentType) {
      case ContentType.VIDEO:
        result.videoUrl = data.videoUrl || null;
        result.content = null;
        break;

      case ContentType.AUDIO:
        result.audioUrl = data.audioUrl || null;
        result.content = null;
        break;

      case ContentType.DOCUMENT:
        result.documentUrl = data.documentUrl || null;
        result.content = null;
        break;

      case ContentType.EXTERNAL_LINK:
        result.externalLink = data.externalLink || null;
        result.content = null;
        break;

      case ContentType.TEXT:
        result.content = data.content;
        break;

      default:
        result.content = data.content || null;
    }

    return result;
  }
  private processContentForUpdate(data: UpdateModuleData, existingModule: ModuleWithLearningPath): {
    contentUpdate: { content?: string | null };
  } {
    const contentType = data.contentType || existingModule.contentType;
    const contentUpdate: { content?: string | null } = {};
    if (data.content !== undefined || data.contentType) {
      switch (contentType) {
        case ContentType.VIDEO:
        case ContentType.AUDIO:
        case ContentType.DOCUMENT:
        case ContentType.EXTERNAL_LINK:
          contentUpdate.content = data.content !== undefined ? data.content : null;
          break;

        case ContentType.TEXT:
          if (data.content !== undefined) {
            contentUpdate.content = data.content;
          }
          break;

        default:
          if (data.content !== undefined) {
            contentUpdate.content = data.content;
          }
      }
    }

    return { contentUpdate };
  }
  private async handleFileUploads(
    data: CreateModuleData,
    files: FileUploads
  ): Promise<{ fileUrls: any; uploadResults: (UploadResult | UploadResult[])[] }> {
    const uploadPromises: Promise<UploadResult | UploadResult[]>[] = [];
    const uploadResults: (UploadResult | UploadResult[])[] = [];
    const folder = `modules`;
    const fileUrls: any = {};
    if (files.thumbnail && files.thumbnail.length > 0) {
      const uploadPromise = this.uploadThumbnail(files.thumbnail[0], `${folder}/thumbnails`)
        .then(result => {
          fileUrls.thumbnailUrl = result.url;
          return result;
        });
      uploadPromises.push(uploadPromise);
    }

    const contentType = data.contentType || ContentType.TEXT;
    
    switch (contentType) {
      case ContentType.VIDEO:
        if (files.video && files.video.length > 0) {
          const uploadPromise = FileUploadService.uploadMultipleFiles(files.video, `${folder}/videos`)
            .then(results => {
              if (results.length > 0) {
                fileUrls.videoUrl = results[0].url;
              }
              return results;
            });
          uploadPromises.push(uploadPromise);
        }
        break;

      case ContentType.AUDIO:
        if (files.audio && files.audio.length > 0) {
          const uploadPromise = FileUploadService.uploadMultipleFiles(files.audio, `${folder}/audio`)
            .then(results => {
              if (results.length > 0) {
                fileUrls.audioUrl = results[0].url;
              }
              return results;
            });
          uploadPromises.push(uploadPromise);
        }
        break;

      case ContentType.DOCUMENT:
        if (files.document && files.document.length > 0) {
          const uploadPromise = FileUploadService.uploadMultipleFiles(files.document, `${folder}/documents`)
            .then(results => {
              if (results.length > 0) {
                fileUrls.documentUrl = results[0].url;
              }
              return results;
            });
          uploadPromises.push(uploadPromise);
        }
        break;
    }
    if (files.attachments && files.attachments.length > 0) {
      const uploadPromise = FileUploadService.uploadMultipleFiles(files.attachments, `${folder}/attachments`)
        .then(results => {
          fileUrls.attachments = results.map(r => r.url);
          return results;
        });
      uploadPromises.push(uploadPromise);
    }
    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises);
      uploadResults.push(...results);
    }

    return { fileUrls, uploadResults };
  }
  private async handleFileUploadsForUpdate(
    data: UpdateModuleData,
    files: FileUploads,
    existingModule: ModuleWithLearningPath
  ): Promise<{ fileUrls: any; uploadResults: (UploadResult | UploadResult[])[]; filesToDelete: string[] }> {
    const uploadResults: (UploadResult | UploadResult[])[] = [];
    const filesToDelete: string[] = [];
    const fileUrls: any = {};
    const folder = `modules`;
    if (files.thumbnail && files.thumbnail.length > 0) {
      if (existingModule.thumbnailUrl) {
        const fileName = this.extractFileName(existingModule.thumbnailUrl);
        if (fileName) filesToDelete.push(fileName);
      }

      const result = await this.uploadThumbnail(files.thumbnail[0], `${folder}/thumbnails`);
      fileUrls.thumbnailUrl = result.url;
      uploadResults.push(result);
    }
    const contentType = data.contentType || existingModule.contentType;
    
    switch (contentType) {
      case ContentType.VIDEO:
        if (files.video && files.video.length > 0) {
          if (existingModule.videoUrl) {
            const fileName = this.extractFileName(existingModule.videoUrl);
            if (fileName) filesToDelete.push(fileName);
          }

          const results = await FileUploadService.uploadMultipleFiles(files.video, `${folder}/videos`);
          if (results.length > 0) {
            fileUrls.videoUrl = results[0].url;
          }
          uploadResults.push(results);
        }
        break;

      case ContentType.AUDIO:
        if (files.audio && files.audio.length > 0) {
          if (existingModule.audioUrl) {
            const fileName = this.extractFileName(existingModule.audioUrl);
            if (fileName) filesToDelete.push(fileName);
          }

          const results = await FileUploadService.uploadMultipleFiles(files.audio, `${folder}/audio`);
          if (results.length > 0) {
            fileUrls.audioUrl = results[0].url;
          }
          uploadResults.push(results);
        }
        break;

      case ContentType.DOCUMENT:
        if (files.document && files.document.length > 0) {
          if (existingModule.documentUrl) {
            const fileName = this.extractFileName(existingModule.documentUrl);
            if (fileName) filesToDelete.push(fileName);
          }

          const results = await FileUploadService.uploadMultipleFiles(files.document, `${folder}/documents`);
          if (results.length > 0) {
            fileUrls.documentUrl = results[0].url;
          }
          uploadResults.push(results);
        }
        break;
    }
    if (files.attachments && files.attachments.length > 0) {
      const results = await FileUploadService.uploadMultipleFiles(files.attachments, `${folder}/attachments`);
      fileUrls.attachments = [
        ...(existingModule.attachments || []),
        ...results.map(r => r.url)
      ];
      uploadResults.push(results);
    }

    return { fileUrls, uploadResults, filesToDelete };
  }
  private async cleanupFailedUploads(uploadResults: (UploadResult | UploadResult[])[]): Promise<void> {
    try {
      console.log('Cleaning up uploaded files due to failure');
      
      const deletePromises: Promise<void>[] = [];
      
      for (const result of uploadResults) {
        if (Array.isArray(result)) {
          for (const upload of result) {
            if (upload.publicId) {
              deletePromises.push(
                FileUploadService.deleteFile(upload.publicId).catch(error => {
                  console.warn(`Failed to delete file ${upload.publicId}:`, error.message);
                })
              );
            }
          }
        } else {
          if (result.publicId) {
            deletePromises.push(
              FileUploadService.deleteFile(result.publicId).catch(error => {
                console.warn(`Failed to delete file ${result.publicId}:`, error.message);
              })
            );
          }
        }
      }
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} uploaded files`);
      }
    } catch (error) {
      console.error('Error cleaning up uploaded files:', error);
    }
  }
  private async cleanupModuleFiles(module: ModuleWithLearningPath): Promise<void> {
    try {
      console.log('Cleaning up module files for module:', module.id);
      
      const deletePromises: Promise<void>[] = [];
      if (module.thumbnailUrl) {
        const fileName = this.extractFileName(module.thumbnailUrl);
        if (fileName) {
          deletePromises.push(
            FileUploadService.deleteFile(fileName).catch(error => {
              console.warn(`Failed to delete thumbnail ${fileName}:`, error.message);
            })
          );
        }
      }
      switch (module.contentType) {
        case ContentType.VIDEO:
          if (module.videoUrl) {
            const fileName = this.extractFileName(module.videoUrl);
            if (fileName) {
              deletePromises.push(
                FileUploadService.deleteFile(fileName).catch(error => {
                  console.warn(`Failed to delete video ${fileName}:`, error.message);
                })
              );
            }
          }
          break;
          
        case ContentType.AUDIO:
          if (module.audioUrl) {
            const fileName = this.extractFileName(module.audioUrl);
            if (fileName) {
              deletePromises.push(
                FileUploadService.deleteFile(fileName).catch(error => {
                  console.warn(`Failed to delete audio ${fileName}:`, error.message);
                })
              );
            }
          }
          break;
          
        case ContentType.DOCUMENT:
          if (module.documentUrl) {
            const fileName = this.extractFileName(module.documentUrl);
            if (fileName) {
              deletePromises.push(
                FileUploadService.deleteFile(fileName).catch(error => {
                  console.warn(`Failed to delete document ${fileName}:`, error.message);
                })
              );
            }
          }
          break;
      }
      if (module.attachments && module.attachments.length > 0) {
        for (const attachmentUrl of module.attachments) {
          const fileName = this.extractFileName(attachmentUrl);
          if (fileName) {
            deletePromises.push(
              FileUploadService.deleteFile(fileName).catch(error => {
                console.warn(`Failed to delete attachment ${fileName}:`, error.message);
              })
            );
          }
        }
      }
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} module files`);
      }
    } catch (error) {
      console.error('Error cleaning up module files:', error);
    }
  }
  private async deleteFiles(fileNames: string[]): Promise<void> {
    try {
      console.log('Deleting files:', fileNames.length);
      
      const deletePromises = fileNames.map(fileName => 
        FileUploadService.deleteFile(fileName).catch(error => {
          console.warn(`Failed to delete file ${fileName}:`, error.message);
          return Promise.resolve(); 
        })
      );
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${fileNames.length} files`);
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  }

  private extractFileName(url: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (error) {
      const pathParts = url.split('/');
      return pathParts[pathParts.length - 1];
    }
  }
  private async validateLearningPathExists(learningPathId: string): Promise<void> {
    try {
      const learningPath = await LearningPathRepository.findById(learningPathId);
      if (!learningPath) {
        throw new ValidationError(`Learning path with ID ${learningPathId} not found`);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to validate learning path existence', error);
    }
  }
  private buildFilters(query: ModuleQueryParams): any {
    const filters: any = {};
    
    if (query.learningPathId) {
      filters.learningPathId = query.learningPathId;
    }
    
    if (query.category) {
      filters.category = { contains: query.category, mode: 'insensitive' };
    }
    
    if (query.difficulty) {
      filters.difficulty = query.difficulty;
    }
    
    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }
    
    if (query.contentType) {
      filters.contentType = query.contentType;
    }
    
    if (query.search) {
      filters.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    return filters;
  }
  private buildPagination(query: ModuleQueryParams): any {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    
    const pagination: any = {
      skip,
      take: limit
    };
    if (query.sortBy) {
      pagination.orderBy = {
        [query.sortBy]: query.sortOrder || 'asc'
      };
    } else {
      pagination.orderBy = {
        orderIndex: 'asc'
      };
    }
    
    return pagination;
  }
}