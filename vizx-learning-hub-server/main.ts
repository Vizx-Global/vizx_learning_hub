import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
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
import verificationRoutes from './src/router/verification.routes';
import quizRoutes from './src/router/quiz.routes';
import achievementRoutes from './src/router/achievement.routes';
import notificationRoutes from './src/router/notification.routes';
import categoryRoutes from './src/router/category.routes';
import departmentRoutes from './src/router/department.routes';
import socialRoutes from './src/router/social.routes';


// Load environment variables from .env file
const envPath = fs.existsSync(path.join(__dirname, '.env')) 
  ? path.join(__dirname, '.env') 
  : path.join(process.cwd(), '.env');

dotenv.config({ path: envPath });
console.log(`Loaded environment from: ${envPath}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

const app = express();
const prisma = new PrismaClient();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.app.corsOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.app.nodeEnv === 'development' ? 5000 : 500, // Allow 5000 requests per 15 min in dev, 500 in prod
  message: { success: false, message: 'Too many requests.' },
  skip: (req) => req.path.startsWith('/uploads/')
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const ensureUploadDirectory = () => {
  try {
    const subs = ['', 'modules', 'modules/thumbnails', 'modules/videos', 'modules/documents', 'modules/audio', 'modules/attachments', 'users', 'users/avatars', 'learning-hub', 'learning-hub/thumbnails'];
    subs.forEach(s => {
      const p = path.join(config.storage.basePath, s);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });
  } catch (e) {
    if (config.app.nodeEnv === 'development') process.exit(1);
  }
};
ensureUploadDirectory();

app.use('/uploads', express.static(config.storage.basePath, {
  maxAge: config.app.nodeEnv === 'production' ? '30d' : '0',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    const mimes: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };
    if (mimes[ext]) res.setHeader('Content-Type', mimes[ext]);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (ext.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

app.get('/health', (req, res) => res.json({ success: true, timestamp: new Date().toISOString(), environment: config.app.nodeEnv }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/learning-paths', learningPathRoutes);
app.use('/api/v1/modules', moduleRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/module-progress', moduleProgressRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/chat', require('./src/router/chat.routes').default);

app.use('/api/v1/leaderboard', require('./src/router/leaderboard.routes').default);
app.use('/api/v1/social', socialRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` }));

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(config.app.nodeEnv === 'development' && { stack: error.stack })
  });
});

import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './src/utils/socket.handler';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.app.corsOrigin,
    credentials: true,
  },
});

app.set('io', io);
setupSocket(io);

httpServer.listen(config.app.port, () => console.log(`API Started on port ${config.app.port}`));

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

export default app;