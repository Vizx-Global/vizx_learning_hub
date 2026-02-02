import { NotificationStatus, NotificationType } from '@prisma/client';
import prisma from '../database';

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
}

export class NotificationRepository {
  static async getByUserId(userId?: string, page: number = 1, limit: number = 10, filters: NotificationFilters = {}) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      notifications,
    };
  }

  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, status: 'UNREAD' },
    });
  }

  static async markAsRead(id: string, userId: string) {
    return await prisma.notification.update({
      where: { id, userId },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  static async delete(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    
    return await prisma.notification.delete({
      where
    });
  }

  static async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    summary?: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: any;
    priority?: string;
  }) {
    return await prisma.notification.create({
      data,
    });
  }

  static async getAdminStats() {
    const [totalSent, unread, read, types] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'UNREAD' } }),
      prisma.notification.count({ where: { status: 'READ' } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: {
          _all: true
        }
      })
    ]);

    const deliveryRate = totalSent > 0 ? ((totalSent - 0) / totalSent) * 100 : 100; // Placeholder for failure tracking
    const openRate = totalSent > 0 ? (read / totalSent) * 100 : 0;

    return {
      totalSent,
      unread,
      read,
      deliveryRate: deliveryRate.toFixed(1),
      openRate: openRate.toFixed(1),
      byType: types.reduce((acc: any, t) => {
        acc[t.type] = t._count._all;
        return acc;
      }, {})
    };
  }
}
