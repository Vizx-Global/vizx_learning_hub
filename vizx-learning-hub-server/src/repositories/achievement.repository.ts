import { PrismaClient, AchievementType, AchievementRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class AchievementRepository {
  static async findAll() {
    return await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findById(id: string) {
    return await prisma.achievement.findUnique({
      where: { id }
    });
  }

  static async create(data: any) {
    return await prisma.achievement.create({
      data
    });
  }

  static async update(id: string, data: any) {
    return await prisma.achievement.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return await prisma.achievement.delete({
      where: { id }
    });
  }

  static async findActive() {
    return await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
