
import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', authenticate, LeaderboardController.getLeaderboard);

export default router;
