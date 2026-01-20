import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/png', 'image/svg+xml',
    'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Invalid file type: ${file.mimetype}`));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } });

export const uploadModuleFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'attachments', maxCount: 10 }
]);

export const uploadMultipleFiles = upload.array('files', 10);
export const uploadSingleFile = (fieldName: string) => upload.single(fieldName);

export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File too large (max 500MB)',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field'
    };
    return res.status(400).json({ success: false, message: messages[error.code] || error.message });
  }
  if (error.message.includes('Invalid file type')) return res.status(400).json({ success: false, message: error.message });
  next(error);
};