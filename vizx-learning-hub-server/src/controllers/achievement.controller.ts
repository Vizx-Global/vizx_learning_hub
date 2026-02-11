import { Request, Response } from 'express';
import { AchievementService } from '../services/achievement.service';
import { asyncHandler } from '../utils/asyncHandler';
import { SuccessResponse } from '../utils/response.util';

export class AchievementController {
  static getAllAchievements = asyncHandler(async (req: Request, res: Response) => {
    const achievements = await AchievementService.getAllAchievements();
    return new SuccessResponse('Achievements retrieved successfully', achievements).send(res);
  });

  static getAchievementById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const achievement = await AchievementService.getAchievementById(id!);
    return new SuccessResponse('Achievement retrieved successfully', achievement).send(res);
  });

  static createAchievement = asyncHandler(async (req: Request, res: Response) => {
    const achievement = await AchievementService.createAchievement(req.body);
    return new SuccessResponse('Achievement created successfully', achievement).send(res);
  });

  static updateAchievement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const achievement = await AchievementService.updateAchievement(id!, req.body);
    return new SuccessResponse('Achievement updated successfully', achievement).send(res);
  });

  static deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await AchievementService.deleteAchievement(id!);
    return new SuccessResponse('Achievement deleted successfully').send(res);
  });

  static getRecentAchievements = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const achievements = await AchievementService.getRecentAchievements(limit);
    return new SuccessResponse('Recent achievements retrieved successfully', achievements).send(res);
  });
}
