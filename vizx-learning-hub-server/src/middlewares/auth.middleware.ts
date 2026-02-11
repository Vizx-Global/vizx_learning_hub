import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import prisma from '../database';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    employeeId?: string;
  };
  file?: any;
  files?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = JWTUtil.verifyAccessToken(token);
    
    req.user = decoded;

    // Track user activity asynchronously
    prisma.user.update({
      where: { id: decoded.userId },
      data: { lastActiveDate: new Date() }
    }).catch(err => console.error('Error updating lastActiveDate:', err));

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};