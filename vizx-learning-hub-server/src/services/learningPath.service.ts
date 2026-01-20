import { LearningPathRepository } from '../repositories/learningPath.repository';
import { LearningPath, LearningPathStatus, Prisma } from '@prisma/client';
import prisma from '../database'; 
import { NotFoundError, ValidationError, DatabaseError } from '../utils/error-handler';

export interface CreateLearningPathData {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  estimatedHours: number;
  minEstimatedHours?: number;
  maxEstimatedHours?: number;
  thumbnailUrl?: string;
  bannerUrl?: string;
  iconUrl?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  skills?: string[];
  isPublic?: boolean;
  isFeatured?: boolean;
  featuredOrder?: number;
}

export class LearningPathService {
  async createLearningPath(data: CreateLearningPathData, createdBy: string): Promise<LearningPath> {
    if (!data.title || !data.description || !data.category) {
      throw new ValidationError('Title, description, and category are required');
    }

    const slug = this.generateSlug(data.title);
    if (await LearningPathRepository.isSlugTaken(slug)) {
      throw new ValidationError('A learning path with this title already exists');
    }

    const learningPathData: Prisma.LearningPathCreateInput = {
      ...data,
      difficulty: data.difficulty || 'BEGINNER',
      prerequisites: data.prerequisites || [],
      learningObjectives: data.learningObjectives || [],
      tags: data.tags || [],
      skills: data.skills || [],
      isPublic: data.isPublic ?? true,
      isFeatured: data.isFeatured ?? false,
      creator: { connect: { id: createdBy } }
    };

    return await LearningPathRepository.create(learningPathData);
  }

  async getLearningPathById(id: string): Promise<LearningPath> {
    const learningPath = await LearningPathRepository.findById(id);
    if (!learningPath) throw new NotFoundError('Learning path not found');
    return learningPath;
  }

  async getLearningPathBySlug(slug: string): Promise<LearningPath> {
    const learningPath = await LearningPathRepository.findBySlug(slug);
    if (!learningPath) throw new NotFoundError('Learning path not found');
    return learningPath;
  }

  async getAllLearningPaths(query: any) {
    const validatedQuery = {
      page: Math.max(1, parseInt(query.page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
      category: query.category?.trim(),
      difficulty: query.difficulty,
      status: query.status,
      isFeatured: query.isFeatured === 'true' ? true : query.isFeatured === 'false' ? false : undefined,
      search: query.search?.trim(),
      sortBy: query.sortBy || 'createdAt',
      sortOrder: (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    };

    const { learningPaths, total } = await LearningPathRepository.findAll(validatedQuery);
    const totalPages = Math.ceil(total / validatedQuery.limit);

    return {
      learningPaths, total, page: validatedQuery.page, limit: validatedQuery.limit, totalPages,
      hasNext: validatedQuery.page < totalPages,
      hasPrev: validatedQuery.page > 1
    };
  }

  async updateLearningPath(id: string, data: any): Promise<LearningPath> {
    await this.getLearningPathById(id);
    if (data.title) {
      const slug = this.generateSlug(data.title);
      if (await LearningPathRepository.isSlugTaken(slug, id)) {
        throw new ValidationError('A learning path with this title already exists');
      }
    }
    return await LearningPathRepository.update(id, data);
  }

  async deleteLearningPath(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.delete(id);
  }

  async publishLearningPath(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.updateStatus(id, 'PUBLISHED');
  }

  async archiveLearningPath(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.updateStatus(id, 'ARCHIVED');
  }

  async draftLearningPath(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.updateStatus(id, 'DRAFT');
  }

  async getFeaturedLearningPaths(limit: number = 10): Promise<LearningPath[]> {
    const { learningPaths } = await LearningPathRepository.findAll({
      page: 1, limit: Math.min(limit, 50), isFeatured: true, status: 'PUBLISHED', sortBy: 'featuredOrder', sortOrder: 'asc'
    });
    return learningPaths;
  }

  async getLearningPathsByCategory(category: string, limit: number = 10): Promise<LearningPath[]> {
    if (!category || category.trim().length === 0) throw new ValidationError('Category is required');
    const result = await LearningPathRepository.findAll({
      page: 1, limit: Math.min(limit, 50), category: category.trim(), status: 'PUBLISHED' as LearningPathStatus, sortBy: 'createdAt', sortOrder: 'desc'
    });
    return result.learningPaths;
  }

  async incrementEnrollmentCount(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.incrementEnrollmentCount(id);
  }

  async incrementCompletionCount(id: string): Promise<LearningPath> {
    await this.getLearningPathById(id);
    return await LearningPathRepository.incrementCompletionCount(id);
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }
}