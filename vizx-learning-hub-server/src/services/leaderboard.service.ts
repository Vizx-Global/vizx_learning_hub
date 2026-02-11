
import { PrismaClient } from '@prisma/client';

export class LeaderboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getLeaderboard(limit: number = 20) {
    // Ranking based on Total Points (Primary) and Longest Streak (Secondary)
    const users = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalPoints: true,
        longestStreak: true,
        currentStreak: true,
        department: {
          select: { name: true }
        },
        jobTitle: true,
        lastActiveDate: true,
        _count: {
          select: {
            moduleProgress: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      },
      orderBy: [
        { totalPoints: 'desc' },
        { longestStreak: 'desc' }
      ],
      take: limit
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      points: user.totalPoints,
      longestStreak: user.longestStreak,
      currentStreak: user.currentStreak,
      modulesCompleted: user._count.moduleProgress,
      department: user.department?.name || '',
      jobTitle: user.jobTitle,
      lastActiveAt: user.lastActiveDate
    }));
  }
}
