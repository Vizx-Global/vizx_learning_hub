
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
        role: 'EMPLOYEE', // Assuming only employees are on the leaderboard
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
        department: true,
        jobTitle: true
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
      avatar: user.avatar,
      points: user.totalPoints,
      longestStreak: user.longestStreak,
      currentStreak: user.currentStreak,
      department: user.department,
      jobTitle: user.jobTitle
    }));
  }
}
