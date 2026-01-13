import { PrismaClient, ProgressStatus, ActivityType, ContentType, EnrollmentStatus } from '@prisma/client';
import { ModuleRepository } from '../repositories/module.repository';
import { LearningPathRepository } from '../repositories/learningPath.repository';
import { 
  UpdateModuleProgressDto, 
  MarkModuleCompleteDto, 
  QueryModuleProgressDto,
  BulkUpdateProgressDto,
  ContentProgressDto
} from '../repositories/module-progress.dto';
import { NotFoundError, BadRequestError, DatabaseError } from '../utils/error-handler';

export class ModuleProgressService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getModuleProgress(enrollmentId: string, moduleId: string, userId: string) {
    try {
      console.log('🔍 Service: Getting module progress:', { enrollmentId, moduleId, userId });
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          userId: userId
        }
      });

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }
      let moduleProgress = await this.prisma.moduleProgress.findUnique({
        where: {
          userId_moduleId_enrollmentId: {
            userId,
            moduleId,
            enrollmentId
          }
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              description: true,
              orderIndex: true,
              estimatedMinutes: true,
              contentType: true,
              videoUrl: true,
              audioUrl: true,
              documentUrl: true,
              externalLink: true,
              thumbnailUrl: true
            }
          }
        }
      });

      if (!moduleProgress) {
        const module = await ModuleRepository.findById(moduleId);
        if (!module) {
          throw new NotFoundError('Module not found');
        }
        if (module.learningPathId !== enrollment.learningPathId) {
          throw new BadRequestError('Module does not belong to the enrolled learning path');
        }
        moduleProgress = await this.prisma.moduleProgress.create({
          data: {
            userId,
            moduleId,
            enrollmentId,
            status: ProgressStatus.NOT_STARTED,
            progress: 0,
            timeSpent: 0,
            lastAccessedAt: new Date()
          },
          include: {
            module: {
              select: {
                id: true,
                title: true,
                description: true,
                orderIndex: true,
                estimatedMinutes: true,
                contentType: true,
                videoUrl: true,
                audioUrl: true,
                documentUrl: true,
                externalLink: true,
                thumbnailUrl: true
              }
            }
          }
        });
      }

      console.log('Service: Module progress retrieved successfully');
      return moduleProgress;
    } catch (error) {
      console.error('Service: Error getting module progress:', error);
      
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to get module progress', error);
    }
  }

  async updateModuleProgress(
    enrollmentId: string, 
    moduleId: string, 
    userId: string, 
    data: UpdateModuleProgressDto
  ) {
    try {
      console.log(' Service: Updating module progress:', { enrollmentId, moduleId, userId, data });

      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          userId: userId
        },
        include: {
          learningPath: {
            select: { title: true }
          }
        }
      });

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }
      const module = await ModuleRepository.findById(moduleId);
      
      if (!module) {
        throw new NotFoundError('Module not found');
      }
      if (module.learningPathId !== enrollment.learningPathId) {
        throw new BadRequestError('Module does not belong to the enrolled learning path');
      }
      const updateData: any = { 
        ...data,
        lastAccessedAt: new Date()
      };
      if (data.status === ProgressStatus.IN_PROGRESS) {
        updateData.startedAt = updateData.startedAt || new Date();
      }
      if (data.status === ProgressStatus.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.progress = 100;
        if (module.completionPoints) {
          updateData.pointsEarned = module.completionPoints;
          await this.createPointsTransaction(
            userId,
            module.completionPoints,
            'MODULE_COMPLETION',
            moduleId,
            `Completed module: ${module.title}`
          );
        }
        await this.prisma.activity.create({
          data: {
            userId,
            type: ActivityType.MODULE_COMPLETED,
            description: `Completed module: ${module.title}`,
            metadata: {
              moduleId,
              moduleTitle: module.title,
              enrollmentId,
              learningPathId: enrollment.learningPathId,
              learningPathTitle: enrollment.learningPath.title
            },
            pointsEarned: updateData.pointsEarned || 0
          }
        });
      }

      const moduleProgress = await this.prisma.moduleProgress.upsert({
        where: {
          userId_moduleId_enrollmentId: {
            userId,
            moduleId,
            enrollmentId
          }
        },
        update: updateData,
        create: {
          userId,
          moduleId,
          enrollmentId,
          status: data.status || ProgressStatus.NOT_STARTED,
          progress: data.progress || 0,
          timeSpent: data.timeSpent || 0,
          lastAccessedAt: new Date(),
          ...(data.quizScore && { quizScore: data.quizScore }),
          ...(data.notes && { notes: data.notes }),
          ...(data.bookmarked !== undefined && { bookmarked: data.bookmarked })
        },
        include: {
          module: {
            select: {
              id: true,
              title: true,
              orderIndex: true,
              estimatedMinutes: true,
              contentType: true,
              thumbnailUrl: true
            }
          }
        }
      });
      await this.updateEnrollmentProgress(enrollmentId, userId);

      console.log('Service: Module progress updated successfully');
      return moduleProgress;
    } catch (error) {
      console.error('Service: Error updating module progress:', error);
      
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to update module progress', error);
    }
  }

  async trackContentProgress(
    enrollmentId: string,
    moduleId: string,
    userId: string,
    data: ContentProgressDto
  ) {
    try {
      console.log('Service: Tracking content progress:', { enrollmentId, moduleId, userId, data });

      const currentProgress = await this.prisma.moduleProgress.findUnique({
        where: {
          userId_moduleId_enrollmentId: {
            userId,
            moduleId,
            enrollmentId
          }
        }
      });

      const updateData: UpdateModuleProgressDto = {
        progress: data.progress,
        lastAccessedAt: new Date()
      };
      if (data.duration) {
        updateData.timeSpent = (currentProgress?.timeSpent || 0) + data.duration;
      }

      if (data.progress === 0) {
        updateData.status = ProgressStatus.NOT_STARTED;
      } else if (data.progress < 100) {
        updateData.status = ProgressStatus.IN_PROGRESS;
        if (!currentProgress?.startedAt) {
          updateData.startedAt = new Date();
        }
      } else if (data.progress === 100 || data.completed === true) {
        updateData.status = ProgressStatus.COMPLETED;
        updateData.completedAt = new Date();
      }

      const result = await this.updateModuleProgress(enrollmentId, moduleId, userId, updateData);
      
      console.log('Service: Content progress tracked successfully');
      return result;
    } catch (error) {
      console.error('Service: Error tracking content progress:', error);
      throw error;
    }
  }

  async getEnrollmentProgressSummary(enrollmentId: string, userId: string) {
    try {
      console.log('Service: Getting enrollment progress summary:', { enrollmentId, userId });

      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          userId: userId
        },
        include: {
          learningPath: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      const modules = await ModuleRepository.findByLearningPathId(enrollment.learningPathId);
      const moduleProgress = await this.prisma.moduleProgress.findMany({
        where: {
          enrollmentId,
          userId
        }
      });
      const progressByModule = new Map(
        moduleProgress.map(mp => [mp.moduleId, mp])
      );
      const requiredModules = modules.filter(m => m.requiresCompletion);
      
      const completedModules = moduleProgress.filter(
        mp => mp.status === ProgressStatus.COMPLETED
      ).length;

      const completedRequiredModules = moduleProgress.filter(mp => {
        const module = modules.find(m => m.id === mp.moduleId);
        return mp.status === ProgressStatus.COMPLETED && module?.requiresCompletion;
      }).length;

      const totalTimeSpent = moduleProgress.reduce(
        (sum, mp) => sum + mp.timeSpent, 0
      );

      const estimatedTotalMinutes = modules.reduce(
        (sum, module) => sum + module.estimatedMinutes, 0
      );
      let overallProgress = 0;
      if (requiredModules.length > 0) {
        overallProgress = (completedRequiredModules / requiredModules.length) * 100;
      } else if (modules.length > 0) {
        overallProgress = (completedModules / modules.length) * 100;
      }
      const modulesWithProgress = modules.map(module => {
        const progress = progressByModule.get(module.id);
        return {
          ...module,
          progress: progress || {
            id: null,
            status: ProgressStatus.NOT_STARTED,
            progress: 0,
            timeSpent: 0,
            startedAt: null,
            completedAt: null,
            bookmarked: false
          }
        };
      });

      const summary = {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt
        },
        learningPath: {
          id: enrollment.learningPath.id,
          title: enrollment.learningPath.title
        },
        summary: {
          totalModules: modules.length,
          requiredModules: requiredModules.length,
          completedModules,
          completedRequiredModules,
          completionPercentage: parseFloat(overallProgress.toFixed(2)),
          totalTimeSpent,
          estimatedTotalMinutes,
          timeRemaining: Math.max(0, estimatedTotalMinutes - totalTimeSpent),
          averageProgressPerModule: modules.length > 0 
            ? parseFloat((moduleProgress.reduce((sum, mp) => sum + mp.progress, 0) / modules.length).toFixed(2))
            : 0
        },
        modules: modulesWithProgress
      };

      console.log('Service: Enrollment progress summary retrieved successfully');
      return summary;
    } catch (error) {
      console.error('Service: Error getting enrollment progress summary:', error);
      
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      throw new DatabaseError('Failed to get enrollment progress summary', error);
    }
  }

  async updateEnrollmentProgress(enrollmentId: string, userId: string) {
    try {
      console.log('Service: Updating enrollment progress:', { enrollmentId, userId });
      const moduleProgress = await this.prisma.moduleProgress.findMany({
        where: {
          enrollmentId,
          userId
        },
        include: {
          module: {
            select: {
              id: true,
              requiresCompletion: true
            }
          }
        }
      });

      if (moduleProgress.length === 0) return null;
      const requiredModules = moduleProgress.filter(mp => mp.module?.requiresCompletion);
      const optionalModules = moduleProgress.filter(mp => !mp.module?.requiresCompletion);

      let completionPercentage = 0;

      if (requiredModules.length > 0) {
        const completedRequired = requiredModules.filter(
          mp => mp.status === ProgressStatus.COMPLETED
        ).length;
        completionPercentage = (completedRequired / requiredModules.length) * 100;
      } else if (moduleProgress.length > 0) {
        const completedAll = moduleProgress.filter(
          mp => mp.status === ProgressStatus.COMPLETED
        ).length;
        completionPercentage = (completedAll / moduleProgress.length) * 100;
      }

      let enrollmentStatus = EnrollmentStatus.ENROLLED;
      if (completionPercentage > 0 && completionPercentage < 100) {
        enrollmentStatus = EnrollmentStatus.IN_PROGRESS;
      } else if (completionPercentage === 100) {
        enrollmentStatus = EnrollmentStatus.COMPLETED;
      }

      const updatedEnrollment = await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: parseFloat(completionPercentage.toFixed(2)),
          status: enrollmentStatus,
          lastActivityAt: new Date(),
          ...(enrollmentStatus === EnrollmentStatus.COMPLETED && {
            completedAt: new Date(),
            finalScore: parseFloat(completionPercentage.toFixed(2))
          })
        }
      });

      console.log('Service: Enrollment progress updated successfully');
      return updatedEnrollment;
    } catch (error) {
      console.error('Service: Error updating enrollment progress:', error);
      throw new DatabaseError('Failed to update enrollment progress', error);
    }
  }

  async getUserProgressOverview(userId: string) {
    try {
      console.log('Service: Getting user progress overview for user:', userId);
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          userId,
          status: {
            in: [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS]
          }
        },
        include: {
          learningPath: {
            select: {
              id: true,
              title: true,
              estimatedHours: true,
              thumbnailUrl: true
            }
          },
          moduleProgress: {
            select: {
              status: true,
              progress: true,
              timeSpent: true,
              completedAt: true,
              module: {
                select: {
                  id: true,
                  requiresCompletion: true
                }
              }
            }
          }
        }
      });

      const overview = await Promise.all(enrollments.map(async (enrollment) => {
        const modules = await ModuleRepository.findByLearningPathId(enrollment.learningPathId);
        
        const moduleProgress = enrollment.moduleProgress;
        const requiredModules = modules.filter(m => m.requiresCompletion);
        
        const completedModules = moduleProgress.filter(
          mp => mp.status === ProgressStatus.COMPLETED
        ).length;

        const completedRequiredModules = moduleProgress.filter(mp => {
          const module = modules.find(m => m.id === mp.module?.id);
          return mp.status === ProgressStatus.COMPLETED && module?.requiresCompletion;
        }).length;

        let completionPercentage = 0;
        if (requiredModules.length > 0) {
          completionPercentage = (completedRequiredModules / requiredModules.length) * 100;
        } else if (modules.length > 0) {
          completionPercentage = (completedModules / modules.length) * 100;
        }

        const totalTimeSpent = moduleProgress.reduce(
          (sum, mp) => sum + mp.timeSpent, 0
        );

        return {
          enrollmentId: enrollment.id,
          learningPath: enrollment.learningPath,
          status: enrollment.status,
          progress: enrollment.progress,
          calculatedProgress: parseFloat(completionPercentage.toFixed(2)),
          completedModules,
          totalModules: modules.length,
          totalTimeSpent,
          lastActivityAt: enrollment.lastActivityAt
        };
      }));
      const totalEnrollments = overview.length;
      const totalCompletedModules = overview.reduce((sum, item) => sum + item.completedModules, 0);
      const totalTimeSpent = overview.reduce((sum, item) => sum + item.totalTimeSpent, 0);
      const averageProgress = totalEnrollments > 0 
        ? overview.reduce((sum, item) => sum + item.calculatedProgress, 0) / totalEnrollments
        : 0;

      const result = {
        overview,
        statistics: {
          totalEnrollments,
          totalCompletedModules,
          totalTimeSpent,
          averageProgress: parseFloat(averageProgress.toFixed(2)),
          activeLearningPaths: overview.filter(item => 
            item.status === EnrollmentStatus.IN_PROGRESS
          ).length
        }
      };

      console.log('Service: User progress overview retrieved successfully');
      return result;
    } catch (error) {
      console.error('Service: Error getting user progress overview:', error);
      throw new DatabaseError('Failed to get user progress overview', error);
    }
  }

async getBookmarkedModules(userId: string, query: QueryModuleProgressDto) {
  try {
    console.log('Service: Getting bookmarked modules for user:', userId);

    const {
      page = 1,
      limit = 20,
      sortBy = 'lastAccessedAt',
      sortOrder = 'desc',
      includeModule = true
    } = query;

    const skip = (page - 1) * limit;
    const validSortFields = [
      'lastAccessedAt', 'createdAt', 'updatedAt', 'progress', 
      'timeSpent', 'completedAt', 'startedAt'
    ];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'lastAccessedAt';

    const [bookmarkedModules, total] = await Promise.all([
      this.prisma.moduleProgress.findMany({
        where: {
          userId,
          bookmarked: true
        },
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          module: includeModule ? {
            select: {
              id: true,
              title: true,
              description: true,
              contentType: true,
              thumbnailUrl: true,
              orderIndex: true,
              estimatedMinutes: true
            }
          } : false,
          enrollment: {
            select: {
              id: true,
              learningPathId: true,
              learningPath: {
                select: {
                  id: true,
                  title: true,
                  thumbnailUrl: true
                }
              }
            }
          }
        }
      }),
      this.prisma.moduleProgress.count({
        where: {
          userId,
          bookmarked: true
        }
      })
    ]);

    const result = {
      bookmarkedModules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    console.log(`Service: Found ${bookmarkedModules.length} bookmarked modules`);
    return result;
  } catch (error) {
    console.error('Service: Error getting bookmarked modules:', error);
    throw new DatabaseError('Failed to get bookmarked modules', error);
  }
}

  private async createPointsTransaction(
    userId: string,
    amount: number,
    source: string,
    sourceId: string,
    description: string
  ) {
    try {
      // Get current user points
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { totalPoints: true }
      });

      const newBalance = (user?.totalPoints || 0) + amount;

      // Create points transaction
      await this.prisma.pointsTransaction.create({
        data: {
          userId,
          type: 'EARNED',
          amount,
          balance: newBalance,
          source,
          sourceId,
          description
        }
      });

      // Update user total points
      await this.prisma.user.update({
        where: { id: userId },
        data: { totalPoints: newBalance }
      });

      console.log(`💰 Service: Points transaction created: ${amount} points added`);
    } catch (error) {
      console.error('❌ Service: Error creating points transaction:', error);
   
    }
  }
}