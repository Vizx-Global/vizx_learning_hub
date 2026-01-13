import { UserRepository } from '../repositories/user.repository';
import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../database';

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
}

export class UserService {
  // GET USER BY ID
  static async getUserById(id: string) {
    const user = await UserRepository.getById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // GET CURRENT USER
  static async getCurrentUser(id: string) {
    const user = await UserRepository.getById(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // GET ALL USERS
  static async getAllUsers(page: number = 1, limit: number = 10, filters: UserFilters = {}) {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await UserRepository.getAllUsers(page, limit, filters);
  }

  // UPDATE USER
  static async updateUser(id: string, updateData: any, updatedBy: string) {
    // Check if user exists
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // If updating email, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await UserRepository.isEmailTaken(updateData.email, id);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // If updating employeeId, check for duplicates
    if (updateData.employeeId && updateData.employeeId !== existingUser.employeeId) {
      const employeeIdExists = await UserRepository.isEmployeeIdTaken(updateData.employeeId, id);
      if (employeeIdExists) {
        throw new Error('Employee ID already exists');
      }
    }

    // Update user
    const updatedUser = await UserRepository.updateUser(id, updateData);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'user.updated',
        entity: 'User',
        entityId: id,
        oldValue: existingUser,
        newValue: updatedUser,
      },
    });

    return updatedUser;
  }

  // DELETE USER
  static async deleteUser(id: string, deletedBy: string) {
    // Check if user exists
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prevent self-deletion
    if (id === deletedBy) {
      throw new Error('Cannot delete your own account');
    }

    // Store user data for audit log before deletion
    const userData = { ...existingUser };

    // Delete user
    await UserRepository.deleteUser(id);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'user.deleted',
        entity: 'User',
        entityId: id,
        oldValue: userData,
      },
    });

    return { message: 'User deleted successfully' };
  }

  // GET USER STATISTICS
  static async getUserStats() {
    return await UserRepository.getUserStats();
  }

  // UPDATE USER STATUS
  static async updateUserStatus(id: string, status: UserStatus, updatedBy: string) {
    // Check if user exists
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const user = await UserRepository.updateUser(id, { status });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'user.status_updated',
        entity: 'User',
        entityId: id,
        oldValue: { status: existingUser.status },
        newValue: { status },
      },
    });

    return user;
  }

  // UPDATE USER ROLE
  static async updateUserRole(id: string, role: UserRole, updatedBy: string) {
    // Check if user exists
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const user = await UserRepository.updateUser(id, { role });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'user.role_updated',
        entity: 'User',
        entityId: id,
        oldValue: { role: existingUser.role },
        newValue: { role },
      },
    });

    return user;
  }

  // GET USERS BY DEPARTMENT
  static async getUsersByDepartment(department: string) {
    return await UserRepository.getUsersByDepartment(department);
  }

  // GET SUBORDINATES
  static async getSubordinates(managerId: string) {
    // Verify the manager exists and is actually a manager/admin
    const manager = await UserRepository.findById(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN) {
      throw new Error('User is not a manager or admin');
    }

    return await UserRepository.getSubordinates(managerId);
  }

  // GET MANAGERS LIST
  static async getManagers() {
    return await UserRepository.getManagers();
  }

  // BULK USER OPERATIONS
  static async bulkUpdateUserStatus(userIds: string[], status: UserStatus, updatedBy: string) {
    // Check if all users exist
    for (const userId of userIds) {
      const userExists = await UserRepository.userExists(userId);
      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }
    }

    // Update all users
    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: { status },
    });

    // Log bulk action
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'user.bulk_status_update',
        entity: 'User',
        oldValue: { userIds, previousStatus: 'multiple' },
        newValue: { userIds, newStatus: status },
      },
    });

    return { message: `${userIds.length} users updated successfully` };
  }

  // SEARCH USERS
  static async searchUsers(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { employeeId: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return users;
  }

  // GET USER ACTIVITY SUMMARY
  static async getUserActivitySummary(userId: string) {
    const user = await UserRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [enrollmentsCount, completedModules, achievementsCount, recentActivity] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.moduleProgress.count({ 
        where: { 
          userId, 
          status: 'COMPLETED' 
        } 
      }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.activity.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          type: true,
          description: true,
          pointsEarned: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
        currentStreak: user.currentStreak,
      },
      summary: {
        enrollmentsCount,
        completedModules,
        achievementsCount,
        recentActivity,
      },
    };
  }
}