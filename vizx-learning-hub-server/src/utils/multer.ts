import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file fieldname or other logic if needed
    // For now, default to users/avatars if not specified
    cb(null, path.join(config.storage.basePath, 'users/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
