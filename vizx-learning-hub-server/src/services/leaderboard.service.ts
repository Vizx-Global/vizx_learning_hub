
import { PrismaClient } from '@prisma/client';

export class LeaderboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getLeaderboard(limit: number = 20, departmentId?: string) {
    console.log(`[LeaderboardService] Generating leaderboard. Limit: ${limit}, Dept: ${departmentId}`);
    
    const where: any = {
      role: { in: ['EMPLOYEE', 'MANAGER'] },
      status: 'ACTIVE',
    };

    if (departmentId && departmentId !== 'undefined' && departmentId !== 'null' && departmentId.trim() !== '') {
      // If it looks like a UUID, filter strictly by departmentId
      if (departmentId.length === 36) {
        where.departmentId = departmentId;
        console.log(`[LeaderboardService] Applying strict departmentId filter: ${departmentId}`);
      } else {
        // Otherwise try name matching
        where.department = {
          name: { contains: departmentId }
        };
        console.log(`[LeaderboardService] Applying partial department name filter: ${departmentId}`);
      }
    }

    console.log('[LeaderboardService] Final WHERE clause:', JSON.stringify(where, null, 2));

    const [users, matchCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          totalPoints: true,
          longestStreak: true,
          currentStreak: true,
          departmentId: true,
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
      }),
      this.prisma.user.count({ where })
    ]);

    console.log(`[LeaderboardService] Query complete. Found ${matchCount} total matches, returning top ${users.length}.`);

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
      departmentId: user.departmentId,
      jobTitle: user.jobTitle,
      lastActiveAt: user.lastActiveDate
    }));
  }
}
