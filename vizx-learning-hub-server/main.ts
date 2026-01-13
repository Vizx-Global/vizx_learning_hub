import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { config } from './src/config';
import authRoutes from './src/router/auth.routes';
import userRoutes from './src/router/user.routes';
import learningPathRoutes from './src/router/learningPath.routes';
import moduleRoutes from './src/router/module.routes';
import { PrismaClient } from '@prisma/client';
import enrollmentRoutes from './src/router/enrollment.routes';
import moduleProgressRoutes from './src/router/module-progress.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: config.app.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  skip: (req) => req.path.startsWith('/uploads/')
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers.authorization ? 'Authorization: [Present]' : 'Authorization: [Missing]');
  if (!req.path.includes('/upload') && !req.path.includes('/with-files')) {
    console.log('Body:', req.body);
  }
  next();
});

const ensureUploadDirectory = () => {
  try {
    if (!fs.existsSync(config.storage.basePath)) {
      fs.mkdirSync(config.storage.basePath, { recursive: true });
      console.log(`Created upload directory: ${config.storage.basePath}`);
    }
    
    const subdirectories = [
      'modules',
      'modules/thumbnails',
      'modules/videos',
      'modules/documents',
      'modules/audio',
      'modules/attachments',
      'users',
      'users/avatars',
      'learning-hub',
      'learning-hub/thumbnails'
    ];

    subdirectories.forEach(subdir => {
      const fullPath = path.join(config.storage.basePath, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created subdirectory: ${fullPath}`);
      }
    });

  } catch (error) {
    console.error('Failed to create upload directories:', error);
    if (config.app.nodeEnv === 'development') {
      process.exit(1);
    }
  }
};

ensureUploadDirectory();

app.use('/uploads', express.static(config.storage.basePath, {
  maxAge: config.app.nodeEnv === 'production' ? '30d' : '0',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    if (ext.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

app.get('/health', (req, res) => {
  console.log('Health check called');
  const uploadDirStatus = fs.existsSync(config.storage.basePath) ? 'healthy' : 'missing';
  
  res.json({
    success: true,
    message: 'AI Learning Hub API is running',
    timestamp: new Date().toISOString(),
    environment: config.app.nodeEnv,
    fileStorage: {
      status: uploadDirStatus,
      path: config.storage.basePath,
      url: config.storage.baseUrl,
      writable: fs.existsSync(config.storage.basePath)
    }
  });
});

app.get('/uploads/test', (req, res) => {
  res.json({
    success: true,
    message: 'File upload system is working',
    storage: {
      basePath: config.storage.basePath,
      baseUrl: config.storage.baseUrl,
      exampleUrl: `${config.storage.baseUrl}/modules/thumbnails/test.jpg`
    }
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/learning-paths', learningPathRoutes);
app.use('/api/v1/modules', moduleRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/module-progress', moduleProgressRoutes);

app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  if (error.code && error.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      message: 'Database error occurred',
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }
  
  if (error.message && error.message.includes('File')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.app.nodeEnv === 'development' && { stack: error.stack }),
  });
});

const PORT = config.app.port;

app.listen(PORT, () => {
  console.log(`
AI Learning Hub API Server Started!
Environment: ${config.app.nodeEnv}
Port: ${PORT}
Started at: ${new Date().toISOString()}

 File Storage Configuration:
   • Storage Path: ${config.storage.basePath}
   • Access URL: ${config.storage.baseUrl}
   • Max File Size: ${config.storage.maxFileSize / 1024 / 1024}MB

 Health & Test Endpoints:
   • Health Check: http://localhost:${PORT}/health
   • Upload Test: http://localhost:${PORT}/uploads/test
   • Static Files: http://localhost:${PORT}/uploads/

 Available Routes:
   • 🔐 Auth:     /api/v1/auth
   • 👤 Users:    /api/v1/users
   • 📚 Learning: /api/v1/learning-paths
   • 📦 Modules:  /api/v1/modules

 Logging enabled for all requests
 Static file serving enabled at /uploads/
 File upload directories created
  `);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;