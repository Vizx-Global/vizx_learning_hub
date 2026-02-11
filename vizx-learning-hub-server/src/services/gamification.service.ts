
import { PrismaClient, ActivityType } from '@prisma/client';
import { NotificationService } from './notification.service';

/**
 * Leveling formula:
 * Level 1: 0 - 999 XP
 * Level 2: 1000 - 2499 XP (Requirement: 1000 XP)
 * Level 3: 2500 - 4999 XP (Requirement: 1500 XP more)
 * Level 4: 5000 - 9999 XP (Requirement: 2500 XP more)
 * Level 5: 10000+ XP (Requirement: 5000 XP more)
 */
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2500,   // Level 3
  5000,   // Level 4
  10000,  // Level 5
  20000,  // Level 6
  40000,  // Level 7
  75000,  // Level 8
  125000, // Level 9
  200000  // Level 10
];

export class GamificationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Calculates the level based on total points
   */
  public calculateLevel(points: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return level;
  }

  /**
   * Updates user points and checks for level up
   */
  public async awardPoints(userId: string, amount: number, source: string, sourceId: string, description: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true, currentLevel: true }
    });

    if (!user) return;

    const oldPoints = user.totalPoints || 0;
    const newPoints = oldPoints + amount;
    const oldLevel = user.currentLevel || 1;
    const newLevel = this.calculateLevel(newPoints);

    // 1. Create Points Transaction
    await this.prisma.pointsTransaction.create({
      data: {
        userId,
        type: 'EARNED',
        amount,
        balance: newPoints,
        source,
        sourceId,
        description
      }
    });

    // 2. Update User (Points and Level if changed)
    const updateData: any = {
      totalPoints: newPoints
    };

    const hasLeveledUp = newLevel > oldLevel;
    if (hasLeveledUp) {
      updateData.currentLevel = newLevel;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // 3. Handle Level Up events
    if (hasLeveledUp) {
      // Log level up activity
      await this.prisma.activity.create({
        data: {
          userId,
          type: ActivityType.LEVEL_UP,
          description: `Reached Level ${newLevel}!`,
          metadata: { oldLevel, newLevel, points: newPoints }
        }
      });

      // Send Level Up notification
      await NotificationService.notifyLevelUp(userId, newLevel);
    }
  }

  /**
   * Returns XP progress for current level
   */
  public getLevelProgress(points: number) {
    const currentLevel = this.calculateLevel(points);
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || (currentThreshold * 2); // Fallback for max level
    
    const xpInCurrentLevel = points - currentThreshold;
    const xpRequiredForNextLevel = nextThreshold - currentThreshold;
    const progressPercentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));

    return {
      currentLevel,
      currentXP: points,
      xpInCurrentLevel,
      xpRequiredForNextLevel,
      nextLevelXP: nextThreshold,
      progressPercentage: parseFloat(progressPercentage.toFixed(2))
    };
  }
}
