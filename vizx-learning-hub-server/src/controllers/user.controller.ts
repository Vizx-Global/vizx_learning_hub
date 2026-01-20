import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  static getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

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
    const updatedUser = await UserService.updateUser(id, req.body, req.user!.userId);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser },
    });
  });

  static deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const result = await UserService.deleteUser(id, req.user!.userId);

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

    const updatedUser = await UserService.updateUserStatus(id, status, req.user!.userId);

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user: updatedUser },
    });
  });

  static updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await UserService.updateUserRole(id, role, req.user!.userId);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser },
    });
  });
}