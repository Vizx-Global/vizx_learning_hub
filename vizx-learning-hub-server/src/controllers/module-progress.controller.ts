import { Request, Response } from 'express';
import { ModuleProgressService } from '../services/module-progress.service';
import { moduleProgressValidators } from '../validator/module-progress.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/assyncHandler';
import { ValidationError, DatabaseError, NotFoundError } from '../utils/error-handler';

export class ModuleProgressController {
  private moduleProgressService: ModuleProgressService;

  constructor(moduleProgressService: ModuleProgressService) {
    this.moduleProgressService = moduleProgressService;
  }

  getModuleProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting module progress for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;

      const progress = await this.moduleProgressService.getModuleProgress(
        enrollmentId,
        moduleId,
        userId
      );

      new SuccessResponse(
        'Module progress retrieved successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting module progress:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  updateModuleProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Updating module progress for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId,
      data: req.body
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;
      const data = validateRequest(moduleProgressValidators.updateModuleProgressSchema, req.body);

      const progress = await this.moduleProgressService.updateModuleProgress(
        enrollmentId,
        moduleId,
        userId,
        data
      );

      new SuccessResponse(
        'Module progress updated successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error updating module progress:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  trackContentProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Tracking content progress for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId,
      data: req.body
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;
      const data = validateRequest(moduleProgressValidators.contentProgressSchema, req.body);

      const progress = await this.moduleProgressService.trackContentProgress(
        enrollmentId,
        moduleId,
        userId,
        data
      );

      new SuccessResponse(
        'Content progress tracked successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error tracking content progress:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  getProgressSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting progress summary for enrollment:', {
      enrollmentId: req.params.enrollmentId,
      userId: req.user!.userId
    });

    try {
      const { enrollmentId } = req.params;
      const userId = req.user!.userId;

      const summary = await this.moduleProgressService.getEnrollmentProgressSummary(
        enrollmentId,
        userId
      );

      new SuccessResponse(
        'Progress summary retrieved successfully',
        summary
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting progress summary:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  getUserProgressOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting user progress overview for:', req.user!.userId);

    try {
      const userId = req.user!.userId;

      const overview = await this.moduleProgressService.getUserProgressOverview(userId);

      new SuccessResponse(
        'User progress overview retrieved successfully',
        overview
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting user progress overview:', error);
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  getBookmarkedModules = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Getting bookmarked modules for:', req.user!.userId);

    try {
      const userId = req.user!.userId;
      const query = validateRequest(moduleProgressValidators.queryModuleProgressSchema, req.query);

      const result = await this.moduleProgressService.getBookmarkedModules(userId, query);

      new SuccessResponse(
        'Bookmarked modules retrieved successfully',
        result.bookmarkedModules,
        undefined,
        result.pagination
      ).send(res);
    } catch (error) {
      console.error('Controller: Error getting bookmarked modules:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  markModuleComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Marking module complete for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;
      const data = validateRequest(moduleProgressValidators.markModuleCompleteSchema, req.body);

      const progress = await this.moduleProgressService.updateModuleProgress(
        enrollmentId,
        moduleId,
        userId,
        {
          ...data,
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date()
        }
      );

      new SuccessResponse(
        'Module marked as completed successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error marking module complete:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  bookmarkModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Bookmarking module for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;

      const progress = await this.moduleProgressService.updateModuleProgress(
        enrollmentId,
        moduleId,
        userId,
        { bookmarked: true }
      );

      new SuccessResponse(
        'Module bookmarked successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error bookmarking module:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });

  removeBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Controller: Removing bookmark for:', {
      enrollmentId: req.params.enrollmentId,
      moduleId: req.params.moduleId,
      userId: req.user!.userId
    });

    try {
      const { enrollmentId, moduleId } = req.params;
      const userId = req.user!.userId;

      const progress = await this.moduleProgressService.updateModuleProgress(
        enrollmentId,
        moduleId,
        userId,
        { bookmarked: false }
      );

      new SuccessResponse(
        'Bookmark removed successfully',
        progress
      ).send(res);
    } catch (error) {
      console.error('Controller: Error removing bookmark:', error);
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error instanceof DatabaseError) {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
      
      throw error;
    }
  });
}