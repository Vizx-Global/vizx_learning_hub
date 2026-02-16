
import { Request, Response } from 'express';
import { SocialService } from '../services/social.service';
import { asyncHandler } from '../utils/asyncHandler';
import { SuccessResponse } from '../utils/response.util';

export class SocialController {
  static getPeersStatus = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const peers = await SocialService.getPeersStatus(userId);
    return res.json({ success: true, message: 'Peer status retrieved successfully', data: peers });
  });

  static nudgePeer = asyncHandler(async (req: any, res: Response) => {
    const senderId = req.user.userId;
    const { receiverId } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    const result = await SocialService.nudgePeer(senderId, receiverId);
    return res.json({ success: true, message: 'Nudge sent successfully', data: result });
  });

  static getPeerActivity = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await SocialService.getPeerActivityFeed(userId, limit);
    return res.json({ success: true, message: 'Peer activity retrieved successfully', data: activities });
  });
}
