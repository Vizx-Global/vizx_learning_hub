import prisma from '../database';
import { UserRole, UserStatus } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  managerId?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  managerId?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  lastLoginAt?: Date;
  lastActiveDate?: Date;
  emailVerified?: boolean;
  mustChangePassword?: boolean;
  passwordChangedAt?: Date;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
}

export class UserRepository {
  // CREATE
  static async create(userData: CreateUserData) {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // READ - Single Users
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  static async findByEmployeeId(employeeId: string) {
    return prisma.user.findUnique({
      where: { employeeId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
      },
    });
  }

  static async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        avatar: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        emailVerified: true,
        twoFactorEnabled: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  // READ - Multiple Users
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ) {
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.role && { role: filters.role }),
      ...(filters.status && { status: filters.status }),
      ...(filters.department && { 
        department: { 
          contains: filters.department
        } 
      }),
      ...(filters.search && {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
          { email: { contains: filters.search } },
          { employeeId: { contains: filters.search } },
          { phone: { contains: filters.search } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          phone: true,
          department: true,
          jobTitle: true,
          role: true,
          status: true,
          totalPoints: true,
          currentLevel: true,
          currentStreak: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              moduleProgress: {
                where: { status: 'COMPLETED' }
              }
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getManagers() {
    return prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.MANAGER, UserRole.ADMIN],
        },
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        department: true,
      },
    });
  }

  // UPDATE
  static async update(id: string, userData: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async updateUser(id: string, userData: any) {
    // Definitive mapping/stripping of fields to match schema
    const data: any = {};
    if (userData.firstName !== undefined) data.firstName = userData.firstName;
    if (userData.lastName !== undefined) data.lastName = userData.lastName;
    if (userData.email !== undefined) data.email = userData.email;
    if (userData.phone !== undefined) data.phone = userData.phone;
    if (userData.phoneNumber !== undefined) data.phone = userData.phoneNumber; // Map phoneNumber to phone if it sneaks in
    if (userData.avatar !== undefined) data.avatar = userData.avatar;
    if (userData.department !== undefined) data.department = userData.department;
    if (userData.jobTitle !== undefined) data.jobTitle = userData.jobTitle;
    if (userData.bio !== undefined) data.bio = userData.bio;
    if (userData.role !== undefined) data.role = userData.role;
    if (userData.status !== undefined) data.status = userData.status;
    if (userData.managerId !== undefined) data.managerId = userData.managerId;

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        avatar: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        managerId: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        emailVerified: true,
        twoFactorEnabled: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  static async updatePassword(id: string, newPassword: string) {
    return prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });
  }

  // DELETE
  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  // STATISTICS
  static async getUserStats() {
    const [totalUsers, activeUsers, usersByRole, usersByDepartment] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['department'],
        _count: true,
        where: {
          department: {
            not: null,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      usersByDepartment,
    };
  }

  // UTILITY METHODS
  static async userExists(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  static async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: { id: true },
    });
    return !!user;
  }

  static async isEmployeeIdTaken(employeeId: string, excludeUserId?: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        employeeId,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: { id: true },
    });
    return !!user;
  }

  static async getUsersByDepartment(department: string) {
    return prisma.user.findMany({
      where: { 
        department: { 
          contains: department
        } 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });
  }

  static async getSubordinates(managerId: string) {
    return prisma.user.findMany({
      where: { managerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        totalPoints: true,
        currentLevel: true,
        lastLoginAt: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }

  // SEARCH USERS
  static async searchUsers(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { employeeId: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return users;
  }
}
