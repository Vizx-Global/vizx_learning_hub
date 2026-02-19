import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingRequiredEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingRequiredEnvVars.length > 0) {
  process.exit(1);
}

const getBaseUploadPath = () => {
  if (process.env.UPLOAD_PATH) {
    return path.isAbsolute(process.env.UPLOAD_PATH) 
      ? process.env.UPLOAD_PATH 
      : path.join(process.cwd(), process.env.UPLOAD_PATH);
  }
  
  if (process.env.NODE_ENV === 'production') {
    return '/var/www/uploads';
  }
  return path.join(process.cwd(), 'uploads');
};

const getBaseUploadUrl = () => {
  // 1. Explicit environment variable always wins
  if (process.env.UPLOAD_URL) {
    return process.env.UPLOAD_URL.replace(/\/$/, ''); // Remove trailing slash if any
  }
  
  // 2. Production detection
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.NODE_ENV === 'prod' ||
                       process.env.APP_ENV === 'production';

  if (isProduction) {
    return 'https://academy-api.vizxglobal.com/uploads';
  }

  // 3. Fallback to localhost for development
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}/uploads`;
};

export const config = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
  },
  storage: {
    basePath: getBaseUploadPath(),
    baseUrl: getBaseUploadUrl(),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000'),
    allowedMimeTypes: {
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      videos: ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a']
    }
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    trustProxy: process.env.TRUST_PROXY === 'true',
  },
};

try {
  if (!fs.existsSync(config.storage.basePath)) {
    fs.mkdirSync(config.storage.basePath, { recursive: true });
  }
} catch (error) {
  if (config.app.nodeEnv === 'development') {
    process.exit(1);
  }
}

export default config;