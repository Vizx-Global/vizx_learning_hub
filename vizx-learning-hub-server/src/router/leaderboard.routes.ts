
import { Router } from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const leaderboardController = new LeaderboardController();

router.get('/', authenticate, leaderboardController.getLeaderboard);

export default router;
