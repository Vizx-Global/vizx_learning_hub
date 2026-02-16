
import { PrismaClient, ActivityType, NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';
import prisma from '../database';

export class SocialService {
  /**
   * Get peers (colleagues in the same department) and their activity status for today.
   */
  static async getPeersStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true }
    });

    if (!user || !user.departmentId) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const peers = await prisma.user.findMany({
      where: {
        departmentId: user.departmentId,
        id: { not: userId },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        currentStreak: true,
        lastActiveDate: true,
        jobTitle: true,
        moduleProgress: {
          where: {
            completedAt: {
              gte: today,
              lt: tomorrow
            },
            status: 'COMPLETED'
          },
          take: 1
        },
        quizAttempts: {
          where: {
            completedAt: {
              gte: today,
              lt: tomorrow
            }
          },
          take: 1
        }
      }
    });

    return peers.map(peer => {
      const hasCompletedModule = peer.moduleProgress.length > 0;
      const hasAttemptedQuiz = peer.quizAttempts.length > 0;
      const isStreakSafe = hasCompletedModule && hasAttemptedQuiz;

      return {
        id: peer.id,
        name: `${peer.firstName} ${peer.lastName}`,
        firstName: peer.firstName,
        avatar: peer.avatar,
        streak: peer.currentStreak,
        jobTitle: peer.jobTitle,
        isStreakSafe,
        needsNudge: !isStreakSafe
      };
    });
  }

  /**
   * Send a nudge (reminder) to a peer.
   */
  static async nudgePeer(senderId: string, receiverId: string) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true, lastName: true }
    });

    if (!sender) throw new Error('Sender not found');

    // Create notification for the receiver
    await NotificationService.notifyPeerReminder(
      receiverId,
      `${sender.firstName} is cheering you on! 📣`,
      `${sender.firstName} ${sender.lastName} noticed you haven't completed your daily learning yet. Keep your streak alive!`,
      senderId
    );

    // Log this as a social interaction activity
    await prisma.activity.create({
      data: {
        userId: senderId,
        type: ActivityType.SOCIAL_INTERACTION,
        description: `Stuck a nudge to help a peer stay on track!`,
        metadata: { receiverId, type: 'NUDGE' }
      }
    });

    return { success: true, message: 'Nudge sent successfully' };
  }

  /**
   * Get recent public activities from peers.
   */
  static async getPeerActivityFeed(userId: string, limit: number = 10) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true }
    });

    const where: any = {
      isPublic: true,
      user: {
        status: 'ACTIVE'
      }
    };

    if (user?.departmentId) {
      where.user.departmentId = user.departmentId;
    }

    const activities = await prisma.activity.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return activities;
  }
}
