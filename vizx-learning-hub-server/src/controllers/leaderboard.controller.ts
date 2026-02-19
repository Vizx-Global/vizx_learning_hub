
import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import prisma from '../database';
import { asyncHandler } from '../utils/asyncHandler';

export class LeaderboardController {
  private static leaderboardService = new LeaderboardService(prisma);

  static getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    console.log('[LeaderboardController] Received request with query:', req.query);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const departmentId = req.query.departmentId as string;
    
    const leaderboard = await LeaderboardController.leaderboardService.getLeaderboard(limit, departmentId);
    
    res.json({
      success: true,
      data: leaderboard
    });
  });
}
