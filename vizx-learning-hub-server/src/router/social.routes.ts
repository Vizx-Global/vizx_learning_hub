
import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/peers', SocialController.getPeersStatus);
router.post('/nudge', SocialController.nudgePeer);
router.get('/activity', SocialController.getPeerActivity);

export default router;
