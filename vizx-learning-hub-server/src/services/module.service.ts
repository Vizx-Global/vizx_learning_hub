import { ModuleRepository } from '../repositories/module.repository';
import { LearningPathRepository } from '../repositories/learningPath.repository';
import { 
  Module, 
  ContentType, 
  DifficultyLevel, 
  Prisma
} from '@prisma/client';
import { ModuleWithLearningPath } from '../repositories/module.repository';
import { 
  NotFoundError, 
  ValidationError, 
  DatabaseError,
} from '../utils/error-handler';
import { FileUploadService, UploadResult } from './file-upload.service';

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

  async createModule(data: CreateModuleData): Promise<Module> {
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
      learningPath: { connect: { id: data.learningPathId } }
    };
    return await ModuleRepository.create(moduleData);
  }

  async createModuleWithFiles(data: CreateModuleData, files: FileUploads = {}): Promise<Module> {
    let uploadResults: (UploadResult | UploadResult[])[] = [];
    try {
      this.validateCreateModuleData(data);
      await this.validateLearningPathExists(data.learningPathId);
      const hasContentFile = !!(files.video?.length || files.audio?.length || files.document?.length);
      this.validateContentTypeSpecificFields(data, hasContentFile);
      const uploadData = await this.handleFileUploads(data, files);
      uploadResults = uploadData.uploadResults;
      return await this.createModule({ ...data, ...uploadData.fileUrls });
    } catch (error) {
      if (uploadResults.length > 0) await this.cleanupFailedUploads(uploadResults);
      throw error;
    }
  }

  async getModuleById(id: string): Promise<ModuleWithLearningPath> {
    if (!id) throw new ValidationError('Module ID is required');
    const module = await ModuleRepository.findById(id);
    if (!module) throw new NotFoundError('Module not found');
    return module;
  }

  async getAllModules(query: ModuleQueryParams = {}) {
    const filters = this.buildFilters(query);
    const pagination = this.buildPagination(query);
    return await ModuleRepository.findAll(filters, pagination);
  }

  async updateModule(id: string, data: UpdateModuleData): Promise<ModuleWithLearningPath> {
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
    return await ModuleRepository.update(id, updateData);
  }

  async updateModuleWithFiles(id: string, data: UpdateModuleData, files: FileUploads = {}): Promise<ModuleWithLearningPath> {
    let uploadResults: (UploadResult | UploadResult[])[] = [];
    let filesToDelete: string[] = [];
    try {
      const existingModule = await this.getModuleById(id);
      const uploadData = await this.handleFileUploadsForUpdate(data, files, existingModule);
      uploadResults = uploadData.uploadResults;
      filesToDelete = uploadData.filesToDelete;
      const updatedModule = await this.updateModule(id, { ...data, ...uploadData.fileUrls });
      if (filesToDelete.length > 0) await this.deleteFiles(filesToDelete);
      return updatedModule;
    } catch (error) {
      if (uploadResults.length > 0) await this.cleanupFailedUploads(uploadResults);
      throw error;
    }
  }

  async deleteModule(id: string): Promise<Module> {
    const module = await this.getModuleById(id);
    const deletedModule = await ModuleRepository.delete(id);
    await this.cleanupModuleFiles(module);
    return deletedModule;
  }

  async getModulesByLearningPath(learningPathId: string): Promise<ModuleWithLearningPath[]> {
    await this.validateLearningPathExists(learningPathId);
    return await ModuleRepository.findByLearningPathId(learningPathId);
  }

  async updateModuleOrder(id: string, orderIndex: number): Promise<Module> {
    await this.getModuleById(id);
    if (orderIndex < 0) throw new ValidationError('Order index must be non-negative');
    return await ModuleRepository.updateOrderIndex(id, orderIndex);
  }

  async bulkUpdateModuleOrder(updates: BulkOrderUpdate[]): Promise<Module[]> {
    for (const update of updates) {
      if (update.orderIndex < 0) throw new ValidationError(`Order index non-negative for ${update.id}`);
    }
    return await ModuleRepository.bulkUpdateOrders(updates);
  }

  async getModulesByContentType(contentType: ContentType, learningPathId?: string): Promise<ModuleWithLearningPath[]> {
    if (!ModuleService.VALID_CONTENT_TYPES.includes(contentType)) throw new ValidationError('Invalid content type');
    if (learningPathId) await this.validateLearningPathExists(learningPathId);
    return await ModuleRepository.findByContentType(contentType, learningPathId);
  }

  async activateModule(id: string): Promise<ModuleWithLearningPath> {
    return await this.updateModule(id, { isActive: true });
  }

  async deactivateModule(id: string): Promise<ModuleWithLearningPath> {
    return await this.updateModule(id, { isActive: false });
  }

  async getModuleCountByLearningPath(learningPathId: string): Promise<number> {
    await this.validateLearningPathExists(learningPathId);
    return await ModuleRepository.countByLearningPathId(learningPathId);
  }

  async validateModuleExists(id: string): Promise<boolean> {
    try {
      await this.getModuleById(id);
      return true;
    } catch {
      return false;
    }
  }

  async uploadFiles(files: Express.Multer.File[], folder: string = 'learning-hub'): Promise<UploadResult[]> {
    return await FileUploadService.uploadMultipleFiles(files, folder);
  }

  async deleteFile(publicId: string, resourceType: string = 'image'): Promise<void> {
    await FileUploadService.deleteFile(publicId);
  }

  async getModuleStats() {
    return await ModuleRepository.getModuleStats();
  }

  async healthCheck() {
    return await ModuleRepository.healthCheck();
  }

  async uploadThumbnail(file: Express.Multer.File, folder: string = 'modules/thumbnails'): Promise<UploadResult> {
    return await FileUploadService.uploadFile(file.buffer, file.originalname, folder);
  }

  async updateModuleThumbnail(id: string, file: Express.Multer.File): Promise<ModuleWithLearningPath> {
    const module = await this.getModuleById(id);
    const result = await this.uploadThumbnail(file, `modules/thumbnails`);
    if (module.thumbnailUrl) {
      const fileName = this.extractFileName(module.thumbnailUrl);
      if (fileName) await FileUploadService.deleteFile(fileName).catch(() => {});
    }
    return await this.updateModule(id, { thumbnailUrl: result.url });
  }

  private validateCreateModuleData(data: CreateModuleData): void {
    if (!data.title?.trim() || !data.learningPathId || !data.category?.trim() || data.estimatedMinutes <= 0) {
      throw new ValidationError('Incomplete or invalid module data');
    }
    if (data.contentType && !ModuleService.VALID_CONTENT_TYPES.includes(data.contentType)) throw new ValidationError('Invalid content type');
    if (data.difficulty && !ModuleService.VALID_DIFFICULTY_LEVELS.includes(data.difficulty)) throw new ValidationError('Invalid difficulty');
  }

  private validateUpdateModuleData(data: UpdateModuleData, existingModule: ModuleWithLearningPath): void {
    if (data.title !== undefined && !data.title.trim()) throw new ValidationError('Title cannot be empty');
    if (data.estimatedMinutes !== undefined && data.estimatedMinutes <= 0) throw new ValidationError('Minutes must be positive');
    if (data.contentType && !ModuleService.VALID_CONTENT_TYPES.includes(data.contentType)) throw new ValidationError('Invalid content type');
    if (data.difficulty && !ModuleService.VALID_DIFFICULTY_LEVELS.includes(data.difficulty)) throw new ValidationError('Invalid difficulty');
  }

  private validateContentTypeSpecificFields(data: CreateModuleData, hasFiles: boolean = false): void {
    const type = data.contentType || ContentType.TEXT;
    switch (type) {
      case ContentType.TEXT: if (!data.content?.trim()) throw new ValidationError('Content required'); break;
      case ContentType.VIDEO: if (!data.videoUrl?.trim() && !hasFiles) throw new ValidationError('Video required'); break;
      case ContentType.AUDIO: if (!data.audioUrl?.trim() && !hasFiles) throw new ValidationError('Audio required'); break;
      case ContentType.DOCUMENT: if (!data.documentUrl?.trim() && !hasFiles) throw new ValidationError('Document required'); break;
      case ContentType.EXTERNAL_LINK: if (!data.externalLink?.trim()) throw new ValidationError('Link required'); break;
      case ContentType.QUIZ:
      case ContentType.ASSESSMENT: if (data.maxQuizAttempts === undefined) throw new ValidationError('Attempts required'); break;
    }
  }

  private processContentForCreation(data: CreateModuleData): any {
    const type = data.contentType || ContentType.TEXT;
    const res: any = { content: data.content || null };
    if ([ContentType.VIDEO, ContentType.AUDIO, ContentType.DOCUMENT, ContentType.EXTERNAL_LINK].includes(type)) res.content = null;
    if (type === ContentType.VIDEO) res.videoUrl = data.videoUrl || null;
    if (type === ContentType.AUDIO) res.audioUrl = data.audioUrl || null;
    if (type === ContentType.DOCUMENT) res.documentUrl = data.documentUrl || null;
    if (type === ContentType.EXTERNAL_LINK) res.externalLink = data.externalLink || null;
    return res;
  }

  private processContentForUpdate(data: UpdateModuleData, existing: ModuleWithLearningPath): { contentUpdate: { content?: string | null } } {
    const type = data.contentType || existing.contentType;
    const contentUpdate: { content?: string | null } = {};
    if (data.content !== undefined || data.contentType) {
      contentUpdate.content = [ContentType.VIDEO, ContentType.AUDIO, ContentType.DOCUMENT, ContentType.EXTERNAL_LINK].includes(type) ? (data.content ?? null) : data.content;
    }
    return { contentUpdate };
  }

  private async handleFileUploads(data: CreateModuleData, files: FileUploads): Promise<{ fileUrls: any; uploadResults: (UploadResult | UploadResult[])[] }> {
    const uploadResults: (UploadResult | UploadResult[])[] = [];
    const fileUrls: any = {};
    const folder = 'modules';
    if (files.thumbnail?.[0]) {
      const res = await this.uploadThumbnail(files.thumbnail[0], `${folder}/thumbnails`);
      fileUrls.thumbnailUrl = res.url;
      uploadResults.push(res);
    }
    const type = data.contentType || ContentType.TEXT;
    if (type === ContentType.VIDEO && files.video?.[0]) {
      const res = await FileUploadService.uploadMultipleFiles(files.video, `${folder}/videos`);
      fileUrls.videoUrl = res[0].url; uploadResults.push(res);
    } else if (type === ContentType.AUDIO && files.audio?.[0]) {
      const res = await FileUploadService.uploadMultipleFiles(files.audio, `${folder}/audio`);
      fileUrls.audioUrl = res[0].url; uploadResults.push(res);
    } else if (type === ContentType.DOCUMENT && files.document?.[0]) {
      const res = await FileUploadService.uploadMultipleFiles(files.document, `${folder}/documents`);
      fileUrls.documentUrl = res[0].url; uploadResults.push(res);
    }
    if (files.attachments?.length) {
      const res = await FileUploadService.uploadMultipleFiles(files.attachments, `${folder}/attachments`);
      fileUrls.attachments = res.map(r => r.url); uploadResults.push(res);
    }
    return { fileUrls, uploadResults };
  }

  private async handleFileUploadsForUpdate(data: UpdateModuleData, files: FileUploads, existing: ModuleWithLearningPath): Promise<{ fileUrls: any; uploadResults: (UploadResult | UploadResult[])[]; filesToDelete: string[] }> {
    const uploadResults: (UploadResult | UploadResult[])[] = [];
    const filesToDelete: string[] = [];
    const fileUrls: any = {};
    const folder = 'modules';
    if (files.thumbnail?.[0]) {
      const oldName = this.extractFileName(existing.thumbnailUrl || '');
      if (oldName) filesToDelete.push(oldName);
      const res = await this.uploadThumbnail(files.thumbnail[0], `${folder}/thumbnails`);
      fileUrls.thumbnailUrl = res.url; uploadResults.push(res);
    }
    const type = data.contentType || existing.contentType;
    if (type === ContentType.VIDEO && files.video?.[0]) {
      const old = this.extractFileName(existing.videoUrl || ''); if (old) filesToDelete.push(old);
      const res = await FileUploadService.uploadMultipleFiles(files.video, `${folder}/videos`);
      fileUrls.videoUrl = res[0].url; uploadResults.push(res);
    } else if (type === ContentType.AUDIO && files.audio?.[0]) {
      const old = this.extractFileName(existing.audioUrl || ''); if (old) filesToDelete.push(old);
      const res = await FileUploadService.uploadMultipleFiles(files.audio, `${folder}/audio`);
      fileUrls.audioUrl = res[0].url; uploadResults.push(res);
    } else if (type === ContentType.DOCUMENT && files.document?.[0]) {
      const old = this.extractFileName(existing.documentUrl || ''); if (old) filesToDelete.push(old);
      const res = await FileUploadService.uploadMultipleFiles(files.document, `${folder}/documents`);
      fileUrls.documentUrl = res[0].url; uploadResults.push(res);
    }
    if (files.attachments?.length) {
      const res = await FileUploadService.uploadMultipleFiles(files.attachments, `${folder}/attachments`);
      fileUrls.attachments = [...(existing.attachments || []), ...res.map(r => r.url)]; uploadResults.push(res);
    }
    return { fileUrls, uploadResults, filesToDelete };
  }

  private async cleanupFailedUploads(results: (UploadResult | UploadResult[])[]): Promise<void> {
    for (const res of results) {
      const items = Array.isArray(res) ? res : [res];
      for (const item of items) if (item.publicId) await FileUploadService.deleteFile(item.publicId).catch(() => {});
    }
  }

  private async cleanupModuleFiles(m: ModuleWithLearningPath): Promise<void> {
    const urls = [m.thumbnailUrl, m.videoUrl, m.audioUrl, m.documentUrl, ...(m.attachments || [])];
    for (const url of urls) {
      const name = this.extractFileName(url || '');
      if (name) await FileUploadService.deleteFile(name).catch(() => {});
    }
  }

  private async deleteFiles(names: string[]): Promise<void> {
    await Promise.all(names.map(n => FileUploadService.deleteFile(n).catch(() => {})));
  }

  private extractFileName(url: string): string | null {
    if (!url) return null;
    try { return new URL(url).pathname.split('/').pop() || null; }
    catch { return url.split('/').pop() || null; }
  }

  private async validateLearningPathExists(id: string): Promise<void> {
    if (!await LearningPathRepository.findById(id)) throw new ValidationError('Path not found');
  }

  private buildFilters(q: ModuleQueryParams): any {
    const f: any = {};
    if (q.learningPathId) f.learningPathId = q.learningPathId;
    if (q.category) f.category = { contains: q.category, mode: 'insensitive' };
    if (q.difficulty) f.difficulty = q.difficulty;
    if (q.isActive !== undefined) f.isActive = q.isActive;
    if (q.contentType) f.contentType = q.contentType;
    if (q.search) f.OR = [{ title: { contains: q.search, mode: 'insensitive' } }, { description: { contains: q.search, mode: 'insensitive' } }];
    return f;
  }

  private buildPagination(q: ModuleQueryParams): any {
    const page = q.page || 1, limit = q.limit || 10;
    return { skip: (page - 1) * limit, take: limit, orderBy: { [q.sortBy || 'orderIndex']: q.sortOrder || 'asc' } };
  }
}