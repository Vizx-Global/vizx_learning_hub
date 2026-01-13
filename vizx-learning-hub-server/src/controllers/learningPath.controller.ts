import { Request, Response } from 'express';
import { LearningPathService } from '../services/learningPath.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/assyncHandler';

export class LearningPathController {
  private learningPathService: LearningPathService;

  constructor(learningPathService: LearningPathService) {
    this.learningPathService = learningPathService;
  }

  createLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.createLearningPath(
      req.body, // Use req.body directly since it's not modified by validation middleware
      req.user!.userId
    );

    new SuccessResponse(
      'Learning path created successfully',
      learningPath,
      201
    ).send(res);
  });

  getAllLearningPaths = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Use validatedData if available, otherwise use req.query
    const query = req.validatedData || req.query;
    
    const result = await this.learningPathService.getAllLearningPaths(query);

    new SuccessResponse(
      'Learning paths retrieved successfully',
      result
    ).send(res);
  });

  // ... keep other methods the same
  getLearningPathById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.getLearningPathById(req.params.id);

    new SuccessResponse(
      'Learning path retrieved successfully',
      learningPath
    ).send(res);
  });

  getLearningPathBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.getLearningPathBySlug(req.params.slug);

    new SuccessResponse(
      'Learning path retrieved successfully',
      learningPath
    ).send(res);
  });

  updateLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.updateLearningPath(
      req.params.id, 
      req.body
    );

    new SuccessResponse(
      'Learning path updated successfully',
      learningPath
    ).send(res);
  });

  deleteLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.learningPathService.deleteLearningPath(req.params.id);

    new SuccessResponse(
      'Learning path deleted successfully'
    ).send(res);
  });

  publishLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.publishLearningPath(req.params.id);

    new SuccessResponse(
      'Learning path published successfully',
      learningPath
    ).send(res);
  });

  archiveLearningPath = asyncHandler(async (req: AuthRequest, res: Response) => {
    const learningPath = await this.learningPathService.archiveLearningPath(req.params.id);

    new SuccessResponse(
      'Learning path archived successfully',
      learningPath
    ).send(res);
  });

  getFeaturedLearningPaths = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.validatedData || req.query;
    const limit = parseInt(query.limit as string) || 10;
    
    const learningPaths = await this.learningPathService.getFeaturedLearningPaths(limit);

    new SuccessResponse(
      'Featured learning paths retrieved successfully',
      learningPaths
    ).send(res);
  });

  getLearningPathsByCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { category } = req.params;
    const query = req.validatedData || req.query;
    const limit = parseInt(query.limit as string) || 10;
    
    const learningPaths = await this.learningPathService.getLearningPathsByCategory(category, limit);

    new SuccessResponse(
      'Learning paths by category retrieved successfully',
      learningPaths
    ).send(res);
  });
}