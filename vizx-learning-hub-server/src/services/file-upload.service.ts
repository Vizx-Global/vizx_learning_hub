import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ValidationError } from '../utils/error-handler';

export interface UploadResult {
  url: string;
  publicId: string; 
  format: string;
  size: number;
}

export class FileUploadService {
  private static allowedFormats = {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    VIDEO: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
    AUDIO: ['mp3', 'wav', 'ogg', 'm4a']
  };

  private static maxFileSizes = {
    IMAGE: 10 * 1024 * 1024, 
    VIDEO: 500 * 1024 * 1024, 
    DOCUMENT: 50 * 1024 * 1024, 
    AUDIO: 20 * 1024 * 1024 
  };

  private static ensureDirectories(folder: string = 'learning-hub'): string {
    const fullPath = path.join(config.storage.basePath, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  static async uploadFile(fileBuffer: Buffer, originalName: string, folder: string = 'learning-hub'): Promise<UploadResult> {
    await this.validateFile(fileBuffer, originalName);
    const folderPath = this.ensureDirectories(folder);
    const fileExt = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(folderPath, fileName);
    
    fs.writeFileSync(filePath, fileBuffer);
    
    return {
      url: `${config.storage.baseUrl}/${folder}/${fileName}`,
      publicId: fileName,
      format: fileExt.replace('.', '').toLowerCase(),
      size: fileBuffer.length,
    };
  }

  static async uploadMultipleFiles(files: Array<{ buffer: Buffer; originalname: string }>, folder: string = 'learning-hub'): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file.buffer, file.originalname, folder)));
  }

  static async deleteFile(publicId: string): Promise<void> {
    const folders = ['learning-hub', 'learning-hub/thumbnails'];
    let fileDeleted = false;
    
    for (const folder of folders) {
      const filePath = path.join(config.storage.basePath, folder, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fileDeleted = true;
        break;
      }
    }
    
    if (!fileDeleted) throw new ValidationError(`File not found: ${publicId}`);
  }

  static async getFileInfo(publicId: string) {
    const folders = ['learning-hub', 'learning-hub/thumbnails'];
    for (const folder of folders) {
      const filePath = path.join(config.storage.basePath, folder, publicId);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          public_id: publicId,
          secure_url: `${config.storage.baseUrl}/${folder}/${publicId}`,
          format: path.extname(publicId).replace('.', '').toLowerCase(),
          bytes: stats.size,
          created_at: stats.birthtime.toISOString(),
        };
      }
    }
    throw new ValidationError('File not found');
  }

  private static async validateFile(fileBuffer: Buffer, originalName: string): Promise<void> {
    const fileExtension = originalName.split('.').pop()?.toLowerCase();
    if (!fileExtension) throw new ValidationError('Invalid file name');
    
    let fileCategory: keyof typeof this.allowedFormats | null = null;
    if (this.allowedFormats.IMAGE.includes(fileExtension)) fileCategory = 'IMAGE';
    else if (this.allowedFormats.VIDEO.includes(fileExtension)) fileCategory = 'VIDEO';
    else if (this.allowedFormats.DOCUMENT.includes(fileExtension)) fileCategory = 'DOCUMENT';
    else if (this.allowedFormats.AUDIO.includes(fileExtension)) fileCategory = 'AUDIO';
    
    if (!fileCategory) throw new ValidationError(`File type not allowed: ${fileExtension}`);
    
    const maxSize = this.maxFileSizes[fileCategory];
    if (fileBuffer.length > maxSize) throw new ValidationError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }

  static getFilePath(publicId: string, folder: string = 'learning-hub'): string {
    return path.join(config.storage.basePath, folder, publicId);
  }

  static getFileUrl(publicId: string, folder: string = 'learning-hub'): string {
    return `${config.storage.baseUrl}/${folder}/${publicId}`;
  }
}