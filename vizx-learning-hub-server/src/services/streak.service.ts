
import { PrismaClient, ActivityType } from '@prisma/client';
import { NotificationService } from './notification.service';

export class StreakService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Check if today is a working day (Mon-Fri)
  private isWorkingDay(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }

  private getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getPreviousWorkingDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    // Go back one day at a time until we find a working day
    do {
      d.setDate(d.getDate() - 1);
    } while (!this.isWorkingDay(d));
    
    return d;
  }

  /**
   * Validates and potentially resets the user's streak if they missed a working day.
   * Should be called before reading streak or updating activity.
   */
  async validateStreak(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastActiveDate: true }
    });

    if (!user || user.currentStreak === 0 || !user.lastActiveDate) return;

    const today = new Date();
    const lastActive = new Date(user.lastActiveDate); // This is the date they last Kept the Streak Alive
    
    // Normalize to start of day
    const todayStart = this.getStartOfDay(today);
    const lastActiveStart = this.getStartOfDay(lastActive);

    // If active today, all good
    if (todayStart.getTime() === lastActiveStart.getTime()) return;

    // Based on logic: If today is a working day, and the last active day was NOT the immediate previous working day, reset.
    // If today is NOT a working day (Sat/Sun), we do not break the streak regardless of when the last active day was
    // (unless it was already broken before the weekend, but we assume it was validated then).
    // Actually, if today is Sat, and last active was Thu, the streak broke on Fri.
    // So we should check if there is a gap of working days between lastActive and Today.

    // Let's iterate from lastActive + 1 day up to yesterday. If any of those are working days, streak is broken.
    
    let pointer = new Date(lastActiveStart);
    pointer.setDate(pointer.getDate() + 1);
    
    let broken = false;
    while (pointer.getTime() < todayStart.getTime()) {
      if (this.isWorkingDay(pointer)) {
        broken = true;
        break;
      }
      pointer.setDate(pointer.getDate() + 1);
    }

    if (broken) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 0 }
      });
    }
  }

  /**
   * Called when a user completes a module or attempts a quiz.
   * Checks if criteria for the day are met (Module AND Quiz).
   */
  async updateStreakImplementation(userId: string): Promise<void> {
    const today = new Date();
    
    // If today is not a working day, streaks don't increase?
    // User requirement: "streak will stay lit when... everyday from Monday to Friday"
    // Usually gamification allows working on weekends to count or 'freeze'.
    // Prompt says: "Monday to Friday this are the working hours".
    // "streak should reset on every 0000hrs daily from Monday to Friday".
    // I'll assume activities on Sat/Sun count as "extra" or just don't break/increment the Mon-Fri streak counter.
    // But simplest interpretation of "streak... everyday from Monday to Friday" is that the counter tracks Mon-Fri consecutive days.
    // If I do it on Saturday, does it increment? I'll assume NO for now to be strict with "Monday to Friday", 
    // OR Yes but it doesn't matter for the "chain" gap check.
    // Let's stick to strict: Only Mon-Fri counts for incrementing.
    
    if (!this.isWorkingDay(today)) return;

    // 1. Validate previous streak integrity first
    await this.validateStreak(userId);

    const todayStart = this.getStartOfDay(today);
    const todayEnd = new Date(today); 
    todayEnd.setHours(23, 59, 59, 999);

    // 2. Check activities for today
    // Need Completed Module
    const completedModule = await this.prisma.moduleProgress.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Need Attempted Quiz (Pass or Fail)
    const attemptedQuiz = await this.prisma.quizAttempt.findFirst({
      where: {
        userId,
        completedAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    if (completedModule && attemptedQuiz) {
      // 3. Check if we already recorded a streak extension for today
      // utilizing LastActiveDate on User to avoid DB lookup on StreakHistory if possible, 
      // but StreakHistory is the source of truth for "Activity Count" logic.
      // Or just check if `lastActiveDate` === `todayStart`.
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, longestStreak: true, lastActiveDate: true }
      });

      if (!user) return;

      const lastActiveStart = user.lastActiveDate ? this.getStartOfDay(new Date(user.lastActiveDate)) : null;

      // If already credited for today, skip
      if (lastActiveStart && lastActiveStart.getTime() === todayStart.getTime()) {
        return;
      }

      // 4. Increment Streak
      // Since we called validateStreak, currentStreak is either valid relative to yesterday-working-day, or 0.
      // So we can safely increment (or set to 1 if 0).
      
      const newCurrentStreak = (user.currentStreak || 0) + 1;
      const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: today // Set to 'now' to mark today as done
        }
      });

      // Log in StreakHistory
      await this.prisma.streakHistory.upsert({
        where: {
          userId_date: {
            userId,
            date: todayStart
          }
        },
        update: {
          completed: true,
          activityCount: { increment: 1 }
        },
        create: {
          userId,
          date: todayStart,
          completed: true,
          activityCount: 1
        }
      });

      // Notify or log activity
      await this.prisma.activity.create({
        data: {
          userId,
          type: ActivityType.STREAK_MILESTONE, // Using close enough type
          description: `Streak increased to ${newCurrentStreak} days!`,
          metadata: { streak: newCurrentStreak }
        }
      });

      // Send notification
      await NotificationService.notifyStreak(userId, newCurrentStreak);
    }
  }
}
