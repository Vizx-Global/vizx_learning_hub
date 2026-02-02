import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export class NotificationController {
  static getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, status, type, all } = req.query;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    // If admin and explicitly asking for all, or on management page
    const targetUserId = (isAdmin && all === 'true') ? undefined : userId;

    const result = await NotificationService.getNotifications(
      targetUserId,
      parseInt(page as string) || 1,
      parseInt(limit as string) || 20,
      {
        status: status as any,
        type: type as any,
      }
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  });

  static markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    await NotificationService.markAsRead(id!, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  });

  static markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  });

  static deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    // If admin, we don't need to check userId ownership
    await NotificationService.deleteNotification(id!, isAdmin ? undefined : userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  });

  static broadcast = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await NotificationService.broadcast(req.body);
    res.json({
      success: true,
      data: result,
      message: 'Broadcast sent successfully',
    });
  });

  static getAdminStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await NotificationService.getAdminStats();
    res.json({
      success: true,
      data: stats
    });
  });
}
