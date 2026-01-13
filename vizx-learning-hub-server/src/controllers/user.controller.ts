import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  static async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.getCurrentUser(req.user!.userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUser(id, req.body, req.user!.userId);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id, req.user!.userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const stats = await UserService.getUserStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedUser = await UserService.updateUserStatus(id, status, req.user!.userId);

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: { user: updatedUser },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updatedUser = await UserService.updateUserRole(id, role, req.user!.userId);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user: updatedUser },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}