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
  static async getUserById(id: string) {
    const user = await UserRepository.getById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  static async getCurrentUser(id: string) {
    const user = await UserRepository.getById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  static async getAllUsers(page: number = 1, limit: number = 10, filters: UserFilters = {}) {
    const p = Math.max(1, page);
    const l = Math.min(100, Math.max(1, limit));
    return await UserRepository.getAllUsers(p, l, filters);
  }

  static async updateUser(id: string, updateData: any, updatedBy: string) {
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) throw new Error('User not found');

    if (updateData.email && updateData.email !== existingUser.email && await UserRepository.isEmailTaken(updateData.email, id)) {
      throw new Error('Email already exists');
    }

    if (updateData.employeeId && updateData.employeeId !== existingUser.employeeId && await UserRepository.isEmployeeIdTaken(updateData.employeeId, id)) {
      throw new Error('Employee ID already exists');
    }

    const updatedUser = await UserRepository.updateUser(id, updateData);
    await prisma.auditLog.create({
      data: { userId: updatedBy, action: 'user.updated', entity: 'User', entityId: id, oldValue: existingUser, newValue: updatedUser },
    });
    return updatedUser;
  }

  static async deleteUser(id: string, deletedBy: string) {
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) throw new Error('User not found');
    if (id === deletedBy) throw new Error('Self-deletion not allowed');

    await UserRepository.deleteUser(id);
    await prisma.auditLog.create({
      data: { userId: deletedBy, action: 'user.deleted', entity: 'User', entityId: id, oldValue: existingUser },
    });
    return { message: 'User deleted successfully' };
  }

  static async getUserStats() {
    return await UserRepository.getUserStats();
  }

  static async updateUserStatus(id: string, status: UserStatus, updatedBy: string) {
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) throw new Error('User not found');

    const user = await UserRepository.updateUser(id, { status });
    await prisma.auditLog.create({
      data: { userId: updatedBy, action: 'user.status_updated', entity: 'User', entityId: id, oldValue: { status: existingUser.status }, newValue: { status } },
    });
    return user;
  }

  static async updateUserRole(id: string, role: UserRole, updatedBy: string) {
    const existingUser = await UserRepository.findById(id);
    if (!existingUser) throw new Error('User not found');

    const user = await UserRepository.updateUser(id, { role });
    await prisma.auditLog.create({
      data: { userId: updatedBy, action: 'user.role_updated', entity: 'User', entityId: id, oldValue: { role: existingUser.role }, newValue: { role } },
    });
    return user;
  }

  static async getUsersByDepartment(department: string) {
    return await UserRepository.getUsersByDepartment(department);
  }

  static async getSubordinates(managerId: string) {
    const manager = await UserRepository.findById(managerId);
    if (!manager || (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN)) {
      throw new Error('Unauthorized or invalid manager');
    }
    return await UserRepository.getSubordinates(managerId);
  }

  static async getManagers() {
    return await UserRepository.getManagers();
  }

  static async bulkUpdateUserStatus(userIds: string[], status: UserStatus, updatedBy: string) {
    for (const id of userIds) if (!await UserRepository.userExists(id)) throw new Error(`User ${id} not found`);

    await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { status } });
    await prisma.auditLog.create({
      data: { userId: updatedBy, action: 'user.bulk_status_update', entity: 'User', newValue: { userIds, newStatus: status } },
    });
    return { message: `${userIds.length} users updated` };
  }

  static async searchUsers(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) throw new Error('Query too short');
    return await prisma.user.findMany({
      where: {
        OR: [{ firstName: { contains: query, mode: 'insensitive' } }, { lastName: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }, { employeeId: { contains: query, mode: 'insensitive' } }],
      },
      take: limit,
      select: { id: true, firstName: true, lastName: true, email: true, employeeId: true, department: true, jobTitle: true, role: true, status: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  }

  static async getUserActivitySummary(userId: string) {
    const user = await UserRepository.getById(userId);
    if (!user) throw new Error('User not found');

    const [enrolled, completed, achievements, recent] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.moduleProgress.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.activity.findMany({ where: { userId }, take: 10, orderBy: { createdAt: 'desc' }, select: { type: true, description: true, pointsEarned: true, createdAt: true } }),
    ]);

    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, totalPoints: user.totalPoints, currentLevel: user.currentLevel, currentStreak: user.currentStreak },
      summary: { enrollmentsCount: enrolled, completedModules: completed, achievementsCount: achievements, recentActivity: recent },
    };
  }
}