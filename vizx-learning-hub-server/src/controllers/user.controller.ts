import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  static getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await UserService.getUserById(id!);

    res.json({
      success: true,
      data: { user },
    });
  });

  static getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await UserService.getCurrentUser(req.user!.userId);

    res.json({
      success: true,
      data: { user },
    });
  });

  static getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, role, status, department, search } = req.query;

    const result = await UserService.getAllUsers(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      {
        role: role as any,
        status: status as any,
        department: department as string,
        search: search as string,
      }
    );

    res.json({
      success: true,
      data: result,
    });
  });

  static updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const updatedUser = await UserService.updateUser(id!, req.body, req.user!.userId);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  });

  static deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await UserService.deleteUser(id!, req.user!.userId);

    res.json({
      success: true,
      message: result.message,
    });
  });

  static getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await UserService.getUserStats();

    res.json({
      success: true,
      data: { stats },
    });
  });

  static updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;


    const updatedUser = await UserService.updateUserStatus(id!, status, req.user!.userId);

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user: updatedUser },
    });
  });

  static updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;


    const updatedUser = await UserService.updateUserRole(id!, role, req.user!.userId);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser },
    });
  });

  static getUserLearningHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user!.userId !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const history = await UserService.getUserLearningHistory(id!);
    return res.json({ success: true, data: history });
  });

  static getUserAchievements = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user!.userId !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const achievements = await UserService.getUserAchievements(id!);
    return res.json({ success: true, data: achievements });
  });

  static getUserPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user!.userId !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const preferences = await UserService.getUserPreferences(id!);
    return res.json({ success: true, data: preferences });
  });

  static updateUserPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user!.userId !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const preferences = await UserService.updateUserPreferences(id!, req.body);
    return res.json({ success: true, message: 'Preferences updated successfully', data: preferences });
  });

  static uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/users/avatars/${req.file.filename}`;
    
    const updatedUser = await UserService.updateUser(id!, { avatar: avatarUrl }, req.user!.userId);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { user: updatedUser, avatarUrl },
    });
  });

  static getUserActivitySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (req.user!.userId !== id && !['ADMIN', 'MANAGER'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const summary = await UserService.getUserActivitySummary(id!);
    return res.json({ success: true, data: summary });
  });
}
