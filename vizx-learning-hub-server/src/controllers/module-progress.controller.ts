import { Response } from 'express';
import { ModuleProgressService } from '../services/module-progress.service';
import { moduleProgressValidators } from '../validator/module-progress.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler';

export class ModuleProgressController {
  private moduleProgressService: ModuleProgressService;

  constructor(moduleProgressService: ModuleProgressService) {
    this.moduleProgressService = moduleProgressService;
  }

  getModuleProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;

    const progress = await this.moduleProgressService.getModuleProgress(
      enrollmentId,
      moduleId,
      userId
    );

    return new SuccessResponse(
      'Module progress retrieved successfully',
      progress
    ).send(res);
  });

  getModuleProgressByModuleId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { moduleId } = req.params;
    const userId = req.user!.userId;

    const progress = await this.moduleProgressService.getModuleProgressByModuleId(
      moduleId,
      userId
    );

    return new SuccessResponse(
      'Module progress retrieved successfully',
      progress
    ).send(res);
  });

  updateModuleProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;
    const data = validateRequest(moduleProgressValidators.updateModuleProgressSchema, req.body) as any;

    const progress = await this.moduleProgressService.updateModuleProgress(
      enrollmentId,
      moduleId,
      userId,
      data
    );

    return new SuccessResponse(
      'Module progress updated successfully',
      progress
    ).send(res);
  });

  trackContentProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;
    const data = validateRequest(moduleProgressValidators.contentProgressSchema, req.body) as any;

    const progress = await this.moduleProgressService.trackContentProgress(
      enrollmentId,
      moduleId,
      userId,
      data
    );

    return new SuccessResponse(
      'Content progress tracked successfully',
      progress
    ).send(res);
  });

  getProgressSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId } = req.params;
    const userId = req.user!.userId;

    const summary = await this.moduleProgressService.getEnrollmentProgressSummary(
      enrollmentId,
      userId
    );

    return new SuccessResponse(
      'Progress summary retrieved successfully',
      summary
    ).send(res);
  });

  getUserProgressOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const overview = await this.moduleProgressService.getUserProgressOverview(userId);

    return new SuccessResponse(
      'User progress overview retrieved successfully',
      overview
    ).send(res);
  });

  getBookmarkedModules = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const query = validateRequest(moduleProgressValidators.queryModuleProgressSchema, req.query);

    const result = await this.moduleProgressService.getBookmarkedModules(userId, query as any);

    return new SuccessResponse(
      'Bookmarked modules retrieved successfully',
      {
        bookmarkedModules: result.bookmarkedModules,
        pagination: result.pagination
      }
    ).send(res);
  });

  markModuleComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;
    const data = validateRequest(moduleProgressValidators.markModuleCompleteSchema, req.body) as any;

    const progress = await this.moduleProgressService.updateModuleProgress(
      enrollmentId,
      moduleId,
      userId,
      {
        ...(data || {}),
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date()
      }
    );

    return new SuccessResponse(
      'Module marked as completed successfully',
      progress
    ).send(res);
  });

  bookmarkModule = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;

    const progress = await this.moduleProgressService.updateModuleProgress(
      enrollmentId,
      moduleId,
      userId,
      { bookmarked: true }
    );

    return new SuccessResponse(
      'Module bookmarked successfully',
      progress
    ).send(res);
  });

  removeBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { enrollmentId, moduleId } = req.params;
    const userId = req.user!.userId;

    const progress = await this.moduleProgressService.updateModuleProgress(
      enrollmentId,
      moduleId,
      userId,
      { bookmarked: false }
    );

    return new SuccessResponse(
      'Bookmark removed successfully',
      progress
    ).send(res);
  });
}