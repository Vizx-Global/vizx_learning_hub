import { NotificationRepository, NotificationFilters } from '../repositories/notification.repository';
import { NotificationStatus, NotificationType } from '@prisma/client';
import prisma from '../database';

export class NotificationService {
  static async getNotifications(userId?: string, page: number = 1, limit: number = 20, filters: NotificationFilters = {}) {
    return await NotificationRepository.getByUserId(userId, page, limit, filters);
  }

  static async getUnreadCount(userId: string) {
    return await NotificationRepository.getUnreadCount(userId);
  }

  static async markAsRead(id: string, userId: string) {
    return await NotificationRepository.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: string) {
    return await NotificationRepository.markAllAsRead(userId);
  }

  static async deleteNotification(id: string, userId?: string) {
    return await NotificationRepository.delete(id, userId);
  }

  static async notifyAchievement(userId: string, achievementTitle: string) {
    return await NotificationRepository.create({
      userId,
      type: 'ACHIEVEMENT',
      title: 'New Achievement Unlocked!',
      message: `Congratulations! You've earned the "${achievementTitle}" achievement.`,
      actionUrl: '/employee-achievements',
      actionLabel: 'View Achievements',
      priority: 'HIGH'
    });
  }

  static async notifyLevelUp(userId: string, newLevel: number) {
    return await NotificationRepository.create({
      userId,
      type: 'ACHIEVEMENT', // Using achievement type for level up visual impact
      title: 'Level Up! 🚀',
      message: `Amazing! You've just reached Level ${newLevel}. Your expertise is growing!`,
      priority: 'HIGH'
    });
  }

  static async notifyModuleCompletion(userId: string, moduleTitle: string, points: number) {
    return await NotificationRepository.create({
      userId,
      type: 'MODULE_COMPLETION',
      title: 'Module Completed!',
      message: `You've successfully completed "${moduleTitle}" and earned ${points} XP!`,
      priority: 'NORMAL'
    });
  }

  static async notifyPathCompletion(userId: string, pathTitle: string) {
    return await NotificationRepository.create({
      userId,
      type: 'PATH_COMPLETION',
      title: 'Course Completed! 🎓',
      message: `Amazing work! You've completed the entire "${pathTitle}" learning path.`,
      actionUrl: '/employee-certificates',
      actionLabel: 'View Certificate',
      priority: 'HIGH'
    });
  }

  static async notifyStreak(userId: string, days: number) {
    return await NotificationRepository.create({
      userId,
      type: 'STREAK',
      title: 'Streak Milestone!',
      message: `You're on fire! You've maintained a learning streak for ${days} days. Keep it up!`,
      priority: 'NORMAL'
    });
  }

  static async notifyWelcome(userId: string, firstName: string) {
    return await NotificationRepository.create({
      userId,
      type: 'WELCOME',
      title: `Welcome to Vizx Academy, ${firstName}! 👋`,
      message: 'We\'re excited to have you here. Start your learning journey by exploring our courses.',
      actionUrl: '/employee-courses',
      actionLabel: 'Browse Courses',
      priority: 'HIGH'
    });
  }

  static async broadcast(data: {
    title: string;
    message: string;
    type: NotificationType;
    audience: string;
    actionUrl?: string;
    actionLabel?: string;
  }) {
    let users: { id: string }[] = [];

    if (data.audience === 'all') {
      users = await prisma.user.findMany({ select: { id: true } });
    } else {
      // Logic for specific department or group
      users = await prisma.user.findMany({
        where: {
          OR: [
            { department: { name: data.audience } },
            { role: data.audience.toUpperCase() as any }
          ]
        },
        select: { id: true }
      });
    }

    const notifications = await Promise.all(
      users.map(user => 
        NotificationRepository.create({
          userId: user.id,
          type: data.type || 'SYSTEM',
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          actionLabel: data.actionLabel,
          priority: 'HIGH'
        })
      )
    );

    return { totalSent: notifications.length };
  }

  static async notifyStatusUpdate(userId: string, status: string) {
    const isActive = status === 'ACTIVE';
    return await NotificationRepository.create({
      userId,
      type: 'SYSTEM',
      title: isActive ? 'Account Activated! 🔓' : 'Account Status Updated',
      message: isActive 
        ? 'Your account has been activated. You can now access all learning materials.' 
        : `Your account status has been changed to ${status.toLowerCase()}.`,
      priority: isActive ? 'HIGH' : 'NORMAL'
    });
  }

  static async notifyEnrollment(userId: string, pathTitle: string) {
    return await NotificationRepository.create({
      userId,
      type: 'PATH_COMPLETION', // Using this for now as it fits courses
      title: 'New Course Enrollment 📚',
      message: `You've successfully enrolled in "${pathTitle}". Happy learning!`,
      actionUrl: '/employee-courses',
      actionLabel: 'Go to Course',
      priority: 'NORMAL'
    });
  }

  static async getAdminStats() {
    return await NotificationRepository.getAdminStats();
  }
}
