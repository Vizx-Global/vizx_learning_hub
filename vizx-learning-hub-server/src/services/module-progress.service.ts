import { PrismaClient, ProgressStatus, ActivityType, EnrollmentStatus } from '@prisma/client';
import { NotificationService } from './notification.service';
import { ModuleRepository } from '../repositories/module.repository';
import { 
  UpdateModuleProgressDto, 
  QueryModuleProgressDto,
  ContentProgressDto
} from '../repositories/module-progress.dto';
import { NotFoundError, BadRequestError, DatabaseError } from '../utils/error-handler';

export class ModuleProgressService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getModuleProgress(enrollmentId: string, moduleId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { id: enrollmentId, userId } });
    if (!enrollment) throw new NotFoundError('Enrollment not found');

    let moduleProgress = await this.prisma.moduleProgress.findUnique({
      where: { userId_moduleId_enrollmentId: { userId, moduleId, enrollmentId } },
      include: { module: { select: { id: true, title: true, description: true, orderIndex: true, estimatedMinutes: true, contentType: true, videoUrl: true, audioUrl: true, documentUrl: true, externalLink: true, thumbnailUrl: true } } }
    });

    if (!moduleProgress) {
      const module = await ModuleRepository.findById(moduleId);
      if (!module) throw new NotFoundError('Module not found');
      if (module.learningPathId !== enrollment.learningPathId) throw new BadRequestError('Module path mismatch');

      moduleProgress = await this.prisma.moduleProgress.create({
        data: { userId, moduleId, enrollmentId, status: ProgressStatus.NOT_STARTED, progress: 0, timeSpent: 0, lastAccessedAt: new Date() },
        include: { module: { select: { id: true, title: true, description: true, orderIndex: true, estimatedMinutes: true, contentType: true, videoUrl: true, audioUrl: true, documentUrl: true, externalLink: true, thumbnailUrl: true } } }
      });
    }
    return moduleProgress;
  }

  async getModuleProgressByModuleId(moduleId: string, userId: string) {
    const progress = await this.prisma.moduleProgress.findFirst({
      where: { moduleId, userId },
      orderBy: { startedAt: 'desc' },
      include: { module: { select: { id: true, title: true, description: true, orderIndex: true, estimatedMinutes: true, contentType: true, thumbnailUrl: true } } }
    });
    if (!progress) throw new NotFoundError('Progress not found');
    return progress;
  }

  async updateModuleProgress(enrollmentId: string, moduleId: string, userId: string, data: UpdateModuleProgressDto) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { learningPath: { select: { title: true } } }
    });
    if (!enrollment) throw new NotFoundError('Enrollment not found');

    const module = await ModuleRepository.findById(moduleId);
    if (!module) throw new NotFoundError('Module not found');
    if (module.learningPathId !== enrollment.learningPathId) throw new BadRequestError('Module path mismatch');

    if (data.status === ProgressStatus.COMPLETED) {
      const quiz = await this.prisma.quiz.findFirst({ where: { moduleId } });
      if (quiz && !await this.prisma.quizAttempt.findFirst({ where: { userId, quizId: quiz.id, enrollmentId, passed: true } })) {
        throw new BadRequestError('Must pass module quiz first');
      }
    }

    const existingProgress = await this.prisma.moduleProgress.findUnique({
      where: { userId_moduleId_enrollmentId: { userId, moduleId, enrollmentId } }
    });

    const isFirstTimeCompletion = data.status === ProgressStatus.COMPLETED && (!existingProgress || existingProgress.status !== ProgressStatus.COMPLETED);

    const updateData: any = { ...data, lastAccessedAt: new Date() };
    if (data.status === ProgressStatus.IN_PROGRESS) updateData.startedAt = updateData.startedAt || new Date();
    
    if (data.status === ProgressStatus.COMPLETED) {
      updateData.completedAt = existingProgress?.completedAt || new Date();
      updateData.progress = 100;
      
      if (isFirstTimeCompletion && module.completionPoints) {
        updateData.pointsEarned = module.completionPoints;
        const { GamificationService } = require('./gamification.service');
        const gamificationService = new GamificationService(this.prisma);
        await gamificationService.awardPoints(userId, module.completionPoints, 'MODULE_COMPLETION', moduleId, `Completed: ${module.title}`);
        
        await this.prisma.activity.create({
          data: {
            userId, type: ActivityType.MODULE_COMPLETED, description: `Completed module: ${module.title}`,
            metadata: { moduleId, moduleTitle: module.title, enrollmentId, learningPathId: enrollment.learningPathId, learningPathTitle: enrollment.learningPath.title },
            pointsEarned: updateData.pointsEarned || 0
          }
        });
        
        // Send notification
        await NotificationService.notifyModuleCompletion(userId, module.title, module.completionPoints || 0);
      } else if (data.status === ProgressStatus.COMPLETED && !isFirstTimeCompletion) {
        // Revision activity (no points)
         await this.prisma.activity.create({
          data: {
            userId, type: ActivityType.MODULE_COMPLETED, description: `Revised module: ${module.title}`,
            metadata: { moduleId, moduleTitle: module.title, enrollmentId, learningPathId: enrollment.learningPathId, learningPathTitle: enrollment.learningPath.title, isRevision: true },
            pointsEarned: 0
          }
        });
      }
    }

    const moduleProgress = await this.prisma.moduleProgress.upsert({
      where: { userId_moduleId_enrollmentId: { userId, moduleId, enrollmentId } },
      update: updateData,
      create: { userId, moduleId, enrollmentId, status: data.status || ProgressStatus.NOT_STARTED, progress: data.progress || 0, timeSpent: data.timeSpent || 0, lastAccessedAt: new Date(), ...data },
      include: { module: { select: { id: true, title: true, orderIndex: true, estimatedMinutes: true, contentType: true, thumbnailUrl: true } } }
    });

    if (data.status === ProgressStatus.COMPLETED) {
      // Lazy load/instantiate StreakService to avoid circular dependency issues if any, although unlikely here
      const { StreakService } = require('./streak.service');
      const streakService = new StreakService(this.prisma);
      await streakService.updateStreakImplementation(userId);
    }

    await this.updateEnrollmentProgress(enrollmentId, userId);
    return moduleProgress;
  }

  async trackContentProgress(enrollmentId: string, moduleId: string, userId: string, data: ContentProgressDto) {
    const current = await this.prisma.moduleProgress.findUnique({ where: { userId_moduleId_enrollmentId: { userId, moduleId, enrollmentId } } });
    const updateData: UpdateModuleProgressDto = { progress: data.progress, lastAccessedAt: new Date() };
    if (data.duration) updateData.timeSpent = (current?.timeSpent || 0) + data.duration;
    if (data.progress === 0) updateData.status = ProgressStatus.NOT_STARTED;
    else if (data.progress < 100) {
      updateData.status = ProgressStatus.IN_PROGRESS;
      if (!current?.startedAt) updateData.startedAt = new Date();
    } else if (data.progress === 100 || data.completed) {
      updateData.status = ProgressStatus.COMPLETED;
      updateData.completedAt = new Date();
    }
    return await this.updateModuleProgress(enrollmentId, moduleId, userId, updateData);
  }

  async getEnrollmentProgressSummary(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { id: enrollmentId, userId }, include: { learningPath: { select: { id: true, title: true } } } });
    if (!enrollment) throw new NotFoundError('Enrollment not found');

    const modules = await ModuleRepository.findByLearningPathId(enrollment.learningPathId);
    const moduleProgress = await this.prisma.moduleProgress.findMany({ where: { enrollmentId, userId } });
    const progressByModule = new Map(moduleProgress.map(mp => [mp.moduleId, mp]));
    const requiredModules = modules.filter(m => m.requiresCompletion);
    const completedModules = moduleProgress.filter(mp => mp.status === ProgressStatus.COMPLETED).length;
    const completedRequiredModules = moduleProgress.filter(mp => modules.find(m => m.id === mp.moduleId)?.requiresCompletion && mp.status === ProgressStatus.COMPLETED).length;
    const totalTimeSpent = moduleProgress.reduce((sum, mp) => sum + mp.timeSpent, 0);
    const estimatedTotalMinutes = modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
    
    let overallProgress = 0;
    if (requiredModules.length > 0) overallProgress = (completedRequiredModules / requiredModules.length) * 100;
    else if (modules.length > 0) overallProgress = (completedModules / modules.length) * 100;

    return {
      enrollment: { id: enrollment.id, status: enrollment.status, progress: enrollment.progress, enrolledAt: enrollment.enrolledAt, lastAccessedAt: enrollment.lastAccessedAt },
      learningPath: { id: enrollment.learningPath.id, title: enrollment.learningPath.title },
      summary: { totalModules: modules.length, requiredModules: requiredModules.length, completedModules, completedRequiredModules, completionPercentage: parseFloat(overallProgress.toFixed(2)), totalTimeSpent, estimatedTotalMinutes, timeRemaining: Math.max(0, estimatedTotalMinutes - totalTimeSpent) },
      modules: modules.map(m => ({ ...m, progress: progressByModule.get(m.id) || { status: ProgressStatus.NOT_STARTED, progress: 0, timeSpent: 0 } }))
    };
  }

  async updateEnrollmentProgress(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { learningPath: true }
    });
    if (!enrollment) return null;

    const moduleProgress = await this.prisma.moduleProgress.findMany({ 
      where: { enrollmentId, userId }, 
      include: { module: { select: { requiresCompletion: true } } } 
    });
    
    if (moduleProgress.length === 0) return null;

    // Calculate progress as average of all modules' progress
    const totalModules = moduleProgress.length; // Note: this assumes we fetched all modules for the path. 
    // Ideally we should compare against the actual module count from learningPath, but for now we use what we have tracked.
    // Better safely: use the percentage sum.
    
    // We need to know the Total Modules in the path to calculate correct average.
    const modulesCount = await ModuleRepository.countByLearningPathId(enrollment.learningPathId);
    
    let percentage = 0;
    if (modulesCount > 0) {
       const currentSum = moduleProgress.reduce((acc, mp) => acc + (mp.progress || 0), 0);
       percentage = currentSum / modulesCount;
    }

    let newStatus: EnrollmentStatus = EnrollmentStatus.ENROLLED;
    if (percentage > 0 && percentage < 100) newStatus = EnrollmentStatus.IN_PROGRESS;
    else if (percentage === 100) newStatus = EnrollmentStatus.COMPLETED;

    // Award points if path is completed for the first time
    if (newStatus === EnrollmentStatus.COMPLETED && enrollment.status !== EnrollmentStatus.COMPLETED) {
      const points = (enrollment.learningPath as any).completionPoints || 500;
      const { GamificationService } = require('./gamification.service');
      const gamificationService = new GamificationService(this.prisma);
      await gamificationService.awardPoints(
        userId, 
        points, 
        'PATH_COMPLETION', 
        enrollment.learningPathId, 
        `Completed learning path: ${enrollment.learningPath.title}`
      );

      await this.prisma.activity.create({
        data: {
          userId,
          type: ActivityType.PATH_COMPLETED,
          description: `Completed learning path: ${enrollment.learningPath.title}`,
          metadata: {
            learningPathId: enrollment.learningPathId,
            enrollmentId: enrollment.id,
            pathTitle: enrollment.learningPath.title,
            pointsEarned: points
          },
          pointsEarned: points
        }
      });

      // Send notification
      await NotificationService.notifyPathCompletion(userId, enrollment.learningPath.title);
    }

    return await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: parseFloat(percentage.toFixed(2)), 
        status: newStatus, 
        lastActivityAt: new Date(),
        ...(newStatus === EnrollmentStatus.COMPLETED && { 
          completedAt: new Date(), 
          finalScore: parseFloat(percentage.toFixed(2)) 
        })
      }
    });
  }

  async getUserProgressOverview(userId: string, includeUnpublished: boolean = false) {
    const where: any = { 
      userId, 
      status: { in: [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS, EnrollmentStatus.COMPLETED] }
    };

    if (!includeUnpublished) {
      where.learningPath = { status: 'PUBLISHED' };
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: { learningPath: { select: { id: true, title: true, estimatedHours: true, thumbnailUrl: true } }, moduleProgress: { include: { module: { select: { id: true, requiresCompletion: true } } } } }
    });

    const overview = await Promise.all(enrollments.map(async (e) => {
      const modules = await ModuleRepository.findByLearningPathId(e.learningPathId);
      const required = modules.filter(m => m.requiresCompletion);
      // Calculate progress based on the average progress of ALL modules
      // This is more granular and rewarding than just counting "Completed" binaries
      const totalModules = modules.length;
      let percentage = 0;
      
      if (totalModules > 0) {
        // Map progress for each module
        const totalProgressSum = modules.reduce((sum, m) => {
          const mp = e.moduleProgress.find(p => p.moduleId === m.id);
          return sum + (mp?.progress || 0);
        }, 0);
        
        percentage = totalProgressSum / totalModules;
      }

      const completed = e.moduleProgress.filter(mp => mp.status === ProgressStatus.COMPLETED).length;

      return { 
        enrollmentId: e.id, 
        learningPath: e.learningPath, 
        status: e.status, 
        progress: e.progress, 
        calculatedProgress: parseFloat(percentage.toFixed(2)), 
        completedModules: completed, 
        totalModules: modules.length, 
        totalTimeSpent: e.moduleProgress.reduce((sum, mp) => sum + mp.timeSpent, 0), 
        lastActivityAt: e.lastActivityAt 
      };
    }));

    return {
      overview,
      statistics: {
        totalEnrollments: overview.length, totalCompletedModules: overview.reduce((sum, i) => sum + i.completedModules, 0), totalTimeSpent: overview.reduce((sum, i) => sum + i.totalTimeSpent, 0),
        averageProgress: overview.length > 0 ? parseFloat((overview.reduce((sum, i) => sum + i.calculatedProgress, 0) / overview.length).toFixed(2)) : 0,
        activeLearningPaths: overview.filter(i => i.status === EnrollmentStatus.IN_PROGRESS).length
      }
    };
  }

  async getBookmarkedModules(userId: string, query: QueryModuleProgressDto) {
    const { page = 1, limit = 20, sortBy = 'lastAccessedAt', sortOrder = 'desc', includeModule = true } = query;
    const skip = (page - 1) * limit;
    const [bookmarkedModules, total] = await Promise.all([
      this.prisma.moduleProgress.findMany({
        where: { userId, bookmarked: true }, skip, take: limit, orderBy: { [sortBy]: sortOrder },
        include: { module: includeModule ? { select: { id: true, title: true, description: true, contentType: true, thumbnailUrl: true, orderIndex: true, estimatedMinutes: true } } : false, enrollment: { select: { id: true, learningPath: { select: { id: true, title: true, thumbnailUrl: true } } } } }
      }),
      this.prisma.moduleProgress.count({ where: { userId, bookmarked: true } })
    ]);

    return { bookmarkedModules, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  private async createPointsTransaction(userId: string, amount: number, source: string, sourceId: string, description: string) {
    const { GamificationService } = require('./gamification.service');
    const gamificationService = new GamificationService(this.prisma);
    await gamificationService.awardPoints(userId, amount, source, sourceId, description);
  }
}