import { PrismaClient, ProgressStatus, ActivityType } from '@prisma/client';
import { CreateEnrollmentDto, UpdateEnrollmentDto, QueryEnrollmentDto } from '../repositories/enrollment.dto';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';

export class EnrollmentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async enrollUser(userId: string, data: CreateEnrollmentDto) {
    const learningPath = await this.prisma.learningPath.findUnique({
      where: { id: data.learningPathId },
      select: { id: true, status: true, isPublic: true }
    });

    if (!learningPath) {
      throw new NotFoundError('Learning path not found');
    }

    if (learningPath.status !== 'PUBLISHED') {
      throw new BadRequestError('Cannot enroll in a learning path that is not published');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId: data.learningPathId
        }
      }
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'DROPPED') {
        return await this.prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'ENROLLED',
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
            progress: 0,
            totalTimeSpent: existingEnrollment.totalTimeSpent
          },
          include: {
            learningPath: {
              select: {
                id: true,
                title: true,
                description: true,
                estimatedHours: true
              }
            }
          }
        });
      }
      throw new ConflictError('Already enrolled');
    }

    const modules = await this.prisma.module.findMany({
      where: { learningPathId: data.learningPathId, isActive: true },
      select: { id: true }
    });

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        learningPathId: data.learningPathId,
        status: 'ENROLLED',
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        progress: 0,
        totalTimeSpent: 0
      },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            description: true,
            estimatedHours: true,
            thumbnailUrl: true
          }
        }
      }
    });

    if (modules.length > 0) {
      const moduleProgressData = modules.map(module => ({
        userId,
        moduleId: module.id,
        enrollmentId: enrollment.id,
        status: 'NOT_STARTED' as ProgressStatus,
        progress: 0,
        timeSpent: 0
      }));

      await this.prisma.moduleProgress.createMany({
        data: moduleProgressData
      });
    }

    await this.prisma.activity.create({
      data: {
        userId,
        type: ActivityType.PATH_ENROLLED,
        description: `Enrolled in: ${enrollment.learningPath.title}`,
        metadata: {
          learningPathId: enrollment.learningPathId,
          enrollmentId: enrollment.id,
          pathTitle: enrollment.learningPath.title
        }
      }
    });

    await this.prisma.learningPath.update({
      where: { id: data.learningPathId },
      data: { enrollmentCount: { increment: 1 } }
    });

    return enrollment;
  }

  async getEnrollmentById(enrollmentId: string, userId?: string) {
    const where: any = { id: enrollmentId };
    if (userId) where.userId = userId;

    const enrollment = await this.prisma.enrollment.findUnique({
      where,
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            description: true,
            estimatedHours: true,
            thumbnailUrl: true,
            difficulty: true,
            category: true
          }
        },
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }
      }
    });

    if (!enrollment) throw new NotFoundError('Enrollment not found');
    return enrollment;
  }

  async getUserEnrollments(userId: string, query: QueryEnrollmentDto) {
    const { status, learningPathId, page = 1, limit = 10, sortBy = 'enrolledAt', sortOrder = 'desc', includePath, includeProgress } = query;
    const where: any = { userId };
    if (status) where.status = status;
    if (learningPathId) where.learningPathId = learningPathId;

    const skip = (page - 1) * limit;
    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          learningPath: includePath ? { select: { id: true, title: true, description: true, estimatedHours: true, thumbnailUrl: true, difficulty: true, category: true, enrollmentCount: true, completionCount: true } } : false,
          moduleProgress: includeProgress ? { select: { id: true, status: true, progress: true, timeSpent: true, startedAt: true, completedAt: true, module: { select: { id: true, title: true, orderIndex: true, estimatedMinutes: true } } } } : false
        }
      }),
      this.prisma.enrollment.count({ where })
    ]);

    const enrichedEnrollments = enrollments.map(enrollment => {
      let calculatedProgress = enrollment.progress;
      if (includeProgress && enrollment.moduleProgress) {
        const completedModules = enrollment.moduleProgress.filter(mp => mp.status === 'COMPLETED').length;
        const totalModules = enrollment.moduleProgress.length;
        if (totalModules > 0) calculatedProgress = (completedModules / totalModules) * 100;
      }
      return { ...enrollment, calculatedProgress };
    });

    return {
      enrollments: enrichedEnrollments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async updateEnrollment(enrollmentId: string, userId: string, data: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { learningPath: { select: { title: true } } }
    });

    if (!enrollment) throw new NotFoundError('Enrollment not found');
    if (enrollment.userId !== userId) throw new BadRequestError('Unauthorized access');
    if (enrollment.status === 'COMPLETED' && data.status && data.status !== 'COMPLETED') throw new BadRequestError('Cannot modify completed enrollment');

    const updateData: any = { ...data };

    if (data.status === 'COMPLETED') {
      const moduleProgress = await this.prisma.moduleProgress.findMany({
        where: { enrollmentId, userId },
        select: { status: true }
      });

      const completedModules = moduleProgress.filter(mp => mp.status === 'COMPLETED').length;
      const totalModules = moduleProgress.length;
      const finalProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 100;

      updateData.progress = finalProgress;
      updateData.completedAt = new Date();
      
      await this.prisma.learningPath.update({
        where: { id: enrollment.learningPathId },
        data: { completionCount: { increment: 1 } }
      });

      await this.prisma.activity.create({
        data: {
          userId,
          type: ActivityType.PATH_COMPLETED,
          description: `Completed: ${enrollment.learningPath.title}`,
          metadata: { learningPathId: enrollment.learningPathId, enrollmentId: enrollment.id, pathTitle: enrollment.learningPath.title, progress: finalProgress }
        }
      });
    }

    if (data.lastAccessedAt || Object.keys(data).length === 0) {
      updateData.lastAccessedAt = new Date();
      updateData.lastActivityAt = new Date();
    }

    return await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: { learningPath: { select: { id: true, title: true, description: true } } }
    });
  }

  async dropEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { learningPath: { select: { title: true } } }
    });

    if (!enrollment || enrollment.userId !== userId) throw new NotFoundError('Enrollment not found');
    if (enrollment.status === 'DROPPED' || enrollment.status === 'COMPLETED') throw new BadRequestError('Action not allowed');

    const droppedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'DROPPED', lastAccessedAt: new Date() }
    });

    await this.prisma.activity.create({
      data: {
        userId,
        type: ActivityType.PATH_ENROLLED, 
        description: `Dropped: ${enrollment.learningPath.title}`,
        metadata: { learningPathId: enrollment.learningPathId, enrollmentId: enrollment.id, pathTitle: enrollment.learningPath.title }
      }
    });

    return droppedEnrollment;
  }

  async getEnrollmentProgress(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId, userId },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            modules: {
              where: { isActive: true },
              select: { id: true, title: true, orderIndex: true, estimatedMinutes: true, contentType: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        },
        moduleProgress: { select: { id: true, moduleId: true, status: true, progress: true, timeSpent: true, startedAt: true, completedAt: true, lastAccessedAt: true, pointsEarned: true, quizScore: true } }
      }
    });

    if (!enrollment) throw new NotFoundError('Enrollment not found');
    const progressByModule = new Map(enrollment.moduleProgress.map(mp => [mp.moduleId, mp]));
    const modulesWithProgress = enrollment.learningPath.modules.map(module => ({
      ...module,
      progress: progressByModule.get(module.id) || null
    }));
    const completedModules = enrollment.moduleProgress.filter(mp => mp.status === 'COMPLETED').length;
    const totalModules = enrollment.learningPath.modules.length;
    const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const totalTimeSpent = enrollment.moduleProgress.reduce((sum, mp) => sum + mp.timeSpent, 0);

    return {
      enrollment: { id: enrollment.id, status: enrollment.status, progress: enrollment.progress, enrolledAt: enrollment.enrolledAt, lastAccessedAt: enrollment.lastAccessedAt },
      learningPath: { id: enrollment.learningPath.id, title: enrollment.learningPath.title },
      modules: modulesWithProgress,
      statistics: { completedModules, totalModules, overallProgress, totalTimeSpent, averageTimePerModule: completedModules > 0 ? Math.round(totalTimeSpent / completedModules) : 0 }
    };
  }

  async getActiveEnrollmentsCount(userId: string) {
    const count = await this.prisma.enrollment.count({
      where: { userId, status: { in: ['ENROLLED', 'IN_PROGRESS'] } }
    });
    return { count };
  }
}