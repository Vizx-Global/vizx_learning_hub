import { AchievementRepository } from '../repositories/achievement.repository';
import { NotFoundError } from '../utils/error-handler';

export class AchievementService {
  static async getAllAchievements() {
    return await AchievementRepository.findAll();
  }

  static async getAchievementById(id: string) {
    const achievement = await AchievementRepository.findById(id);
    if (!achievement) throw new NotFoundError('Achievement not found');
    return achievement;
  }

  static async createAchievement(data: any) {
    return await AchievementRepository.create(data);
  }

  static async updateAchievement(id: string, data: any) {
    await this.getAchievementById(id); // Ensure it exists
    return await AchievementRepository.update(id, data);
  }

  static async deleteAchievement(id: string) {
    await this.getAchievementById(id); // Ensure it exists
    return await AchievementRepository.delete(id);
  }

  static async getActiveAchievements() {
    return await AchievementRepository.findActive();
  }
}
