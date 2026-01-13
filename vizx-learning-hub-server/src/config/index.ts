import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingRequiredEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingRequiredEnvVars.length > 0) {
  console.error('Missing REQUIRED environment variables:');
  missingRequiredEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\n Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}
const getBaseUploadPath = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.UPLOAD_PATH || '/var/www/uploads';
  }
  return path.join(process.cwd(), 'uploads');
};
const getBaseUploadUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.UPLOAD_URL || 'https://your-domain.com/uploads';
  }
  return `http://localhost:${process.env.PORT || 3000}/uploads`;
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
console.log('Configuration loaded successfully');
console.log(`Environment: ${config.app.nodeEnv}`);
console.log(`Server will run on port: ${config.app.port}`);
console.log(`File storage path: ${config.storage.basePath}`);
console.log(`File access URL: ${config.storage.baseUrl}`);

if (config.app.nodeEnv === 'development') {
  console.log('\nDevelopment Mode Active:');
  console.log('   - CORS enabled for:', config.app.corsOrigin.join(', '));
  console.log('   - Local file storage enabled');
} else {
  console.log('\nProduction Mode Active:');
  console.log('   - Linode file storage enabled');
}

import fs from 'fs';
try {
  if (!fs.existsSync(config.storage.basePath)) {
    fs.mkdirSync(config.storage.basePath, { recursive: true });
    console.log(`Created upload directory: ${config.storage.basePath}`);
  } else {
    console.log(`Upload directory exists: ${config.storage.basePath}`);
  }
} catch (error) {
  console.error('Failed to create upload directory:', error);
  if (config.app.nodeEnv === 'development') {
    process.exit(1);
  }
}

export default config;