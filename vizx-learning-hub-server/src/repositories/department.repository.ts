import prisma from '../database';
import { BadRequestError } from '../utils/error-handler';

export interface CreateDepartmentData {
  name: string;
  description?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export class DepartmentRepository {
  static async create(data: CreateDepartmentData) {
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestError('Department with this name already exists');
    }

    return prisma.department.create({
      data,
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

  static async findAll(options: { 
    search?: string; 
    isActive?: boolean;
    skip?: number;
    take?: number;
  } = {}) {
    const { search, isActive, skip = 0, take = 10 } = options;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: true,
              cohorts: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({ where }),
    ]);

    return { departments, total };
  }

  static async findById(id: string) {
    return prisma.department.findUnique({
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
        _count: {
          select: {
            users: true,
            cohorts: true,
          },
        },
      },
    });
  }

  static async update(id: string, data: UpdateDepartmentData) {
    if (data.name) {
      const existing = await prisma.department.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestError('Department with this name already exists');
      }
    }

    return prisma.department.update({
      where: { id },
      data,
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

  static async delete(id: string) {
    // Check if department has users
    const userCount = await prisma.user.count({ where: { departmentId: id } });
    if (userCount > 0) {
      throw new BadRequestError('Cannot delete department with active users. Reassign users first.');
    }

    return prisma.department.delete({
      where: { id },
    });
  }

  static async getDepartmentStats(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            totalPoints: true,
            currentStreak: true,
            enrollments: {
              select: {
                status: true,
                progress: true,
              },
            },
          },
        },
      },
    });

    if (!department) return null;

    const userCount = department.users.length;
    const totalPoints = department.users.reduce((acc, u) => acc + u.totalPoints, 0);
    const avgPoints = userCount > 0 ? totalPoints / userCount : 0;
    
    let totalProgress = 0;
    let enrollmentCount = 0;
    let completedCount = 0;

    department.users.forEach(u => {
      u.enrollments.forEach(e => {
        totalProgress += e.progress;
        enrollmentCount++;
        if (e.status === 'COMPLETED') completedCount++;
      });
    });

    return {
      id: department.id,
      name: department.name,
      userCount,
      totalPoints,
      averagePointsPerUser: avgPoints,
      averageProgress: enrollmentCount > 0 ? totalProgress / enrollmentCount : 0,
      completionRate: enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0,
    };
  }
}
