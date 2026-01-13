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
  duration?: number;
  width?: number;
  height?: number; 
  pages?: number; 
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
      console.log(`Created directory: ${fullPath}`);
    }
    
    return fullPath;
  }
  static async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = 'learning-hub',
    resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
  ): Promise<UploadResult> {
    try {
      console.log(`Uploading file: ${originalName} to folder: ${folder}`);

      await this.validateFile(fileBuffer, originalName, resourceType);
      const folderPath = this.ensureDirectories(folder);

      const fileExt = path.extname(originalName);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, fileBuffer);
      const fileUrl = `${config.storage.baseUrl}/${folder}/${fileName}`;
      
      console.log(` File saved locally: ${filePath}`);
      const uploadResult: UploadResult = {
        url: fileUrl,
        publicId: fileName,
        format: fileExt.replace('.', '').toLowerCase(),
        size: fileBuffer.length,
      };
      
      return uploadResult;
    } catch (error) {
      console.error(' File upload service error:', error);
      throw error;
    }
  }

  static async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; originalname: string }>,
    folder: string = 'learning-hub'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file.buffer, file.originalname, folder)
    );

    return Promise.all(uploadPromises);
  }
  static async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    try {
      console.log(` Deleting file: ${publicId}`);
      const folders = ['learning-hub', 'learning-hub/thumbnails'];
      
      let fileDeleted = false;
      
      for (const folder of folders) {
        const filePath = path.join(config.storage.basePath, folder, publicId);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(` File deleted: ${filePath}`);
          fileDeleted = true;
          break;
        }
      }
      
      if (!fileDeleted) {
        throw new ValidationError(`File not found: ${publicId}`);
      }
    } catch (error) {
      console.error(' File deletion error:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Failed to delete file');
    }
  }

  static async getFileInfo(publicId: string) {
    try {
  
      const folders = ['learning-hub', 'learning-hub/thumbnails'];
      
      for (const folder of folders) {
        const filePath = path.join(config.storage.basePath, folder, publicId);
        
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const fileExt = path.extname(publicId).replace('.', '').toLowerCase();
          
          return {
            public_id: publicId,
            secure_url: `${config.storage.baseUrl}/${folder}/${publicId}`,
            format: fileExt,
            bytes: stats.size,
            created_at: stats.birthtime.toISOString(),
            width: null,
            height: null, 
            duration: null, 
          };
        }
      }
      
      throw new ValidationError('File not found');
    } catch (error) {
      throw new ValidationError('Failed to get file information');
    }
  }
  private static async validateFile(
    fileBuffer: Buffer, 
    originalName: string, 
    resourceType: string
  ): Promise<void> {
    const fileExtension = originalName.split('.').pop()?.toLowerCase();
    const fileSize = fileBuffer.length;

    if (!fileExtension) {
      throw new ValidationError('Invalid file name');
    }
    
    let fileCategory: keyof typeof this.allowedFormats;
    if (this.allowedFormats.IMAGE.includes(fileExtension)) {
      fileCategory = 'IMAGE';
    } else if (this.allowedFormats.VIDEO.includes(fileExtension)) {
      fileCategory = 'VIDEO';
    } else if (this.allowedFormats.DOCUMENT.includes(fileExtension)) {
      fileCategory = 'DOCUMENT';
    } else if (this.allowedFormats.AUDIO.includes(fileExtension)) {
      fileCategory = 'AUDIO';
    } else {
      throw new ValidationError(`File type not allowed: ${fileExtension}`);
    }
    
    const maxSize = this.maxFileSizes[fileCategory];
    if (fileSize > maxSize) {
      throw new ValidationError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }

    console.log(`File validation passed: ${originalName} (${fileCategory})`);
  }
  static generateVideoThumbnail(videoPublicId: string): string {
    console.warn('Video thumbnail generation requires ffmpeg. Using placeholder.');
    return `${config.storage.baseUrl}/placeholders/video-thumbnail.jpg`;
  }
  static generatePdfThumbnail(pdfPublicId: string): string {
    console.warn('PDF thumbnail generation requires PDF processing library. Using placeholder.');
    return `${config.storage.baseUrl}/placeholders/pdf-thumbnail.jpg`;
  }
  static getFilePath(publicId: string, folder: string = 'learning-hub'): string {
    return path.join(config.storage.basePath, folder, publicId);
  }
  static getFileUrl(publicId: string, folder: string = 'learning-hub'): string {
    return `${config.storage.baseUrl}/${folder}/${publicId}`;
  }
}