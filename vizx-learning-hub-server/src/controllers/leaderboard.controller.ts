
import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboard.service';
import prisma from '../database';
import { handleError } from '../utils/error-handler';

export class LeaderboardController {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService(prisma);
  }

  getLeaderboard = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const leaderboard = await this.leaderboardService.getLeaderboard(limit);
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      handleError(res, error);
    }
  };
}
