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
  private learningPathRepository: LearningPathRepository;

  constructor() {
    this.learningPathRepository = new LearningPathRepository();
  }

  async createLearningPath(data: CreateLearningPathData, createdBy: string): Promise<LearningPath> {
    try {
      // Validate required fields
      if (!data.title || !data.description || !data.category) {
        throw new ValidationError('Title, description, and category are required');
      }

      // Check if slug would be unique
      const slug = this.generateSlug(data.title);
      const slugExists = await LearningPathRepository.isSlugTaken(slug);
      
      if (slugExists) {
        throw new ValidationError('A learning path with this title already exists');
      }

      const learningPathData: Prisma.LearningPathCreateInput = {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        subcategory: data.subcategory,
        difficulty: data.difficulty || 'BEGINNER',
        estimatedHours: data.estimatedHours,
        minEstimatedHours: data.minEstimatedHours,
        maxEstimatedHours: data.maxEstimatedHours,
        thumbnailUrl: data.thumbnailUrl,
        bannerUrl: data.bannerUrl,
        iconUrl: data.iconUrl,
        prerequisites: data.prerequisites || [],
        learningObjectives: data.learningObjectives || [],
        tags: data.tags || [],
        skills: data.skills || [],
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
        featuredOrder: data.featuredOrder,
        creator: {
          connect: { id: createdBy }
        }
      };

      return await LearningPathRepository.create(learningPathData);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      console.error('Service error in createLearningPath:', error);
      throw new DatabaseError('Failed to create learning path');
    }
  }

  async getLearningPathById(id: string): Promise<LearningPath> {
    try {
      const learningPath = await LearningPathRepository.findById(id);
      
      if (!learningPath) {
        throw new NotFoundError('Learning path not found');
      }

      return learningPath;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in getLearningPathById:', error);
      throw new DatabaseError('Failed to retrieve learning path');
    }
  }

  async getLearningPathBySlug(slug: string): Promise<LearningPath> {
    try {
      const learningPath = await LearningPathRepository.findBySlug(slug);
      
      if (!learningPath) {
        throw new NotFoundError('Learning path not found');
      }

      return learningPath;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in getLearningPathBySlug:', error);
      throw new DatabaseError('Failed to retrieve learning path');
    }
  }

  async getAllLearningPaths(query: any): Promise<{ 
    learningPaths: LearningPath[]; 
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log('Service: Getting learning paths with query:', query);
      
      // Validate and sanitize query parameters
      const validatedQuery = {
        page: Math.max(1, parseInt(query.page) || 1),
        limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
        category: query.category?.trim(),
        difficulty: query.difficulty,
        status: query.status,
        isFeatured: query.isFeatured !== undefined ? query.isFeatured === 'true' : undefined,
        search: query.search?.trim(),
        sortBy: query.sortBy || 'createdAt',
        sortOrder: (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
      };

      console.log('Service: Validated query parameters:', validatedQuery);

      const { learningPaths, total } = await LearningPathRepository.findAll(validatedQuery);

      const totalPages = Math.ceil(total / validatedQuery.limit);
      const hasNext = validatedQuery.page < totalPages;
      const hasPrev = validatedQuery.page > 1;

      const result = {
        learningPaths,
        total,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        totalPages,
        hasNext,
        hasPrev
      };

      console.log(`Service: Retrieved ${learningPaths.length} learning paths, total: ${total}, pages: ${totalPages}`);

      return result;
    } catch (error) {
      console.error('Service: Error in getAllLearningPaths:', error);
      return {
        learningPaths: [],
        total: 0,
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  async updateLearningPath(id: string, data: any): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      if (data.title) {
        const slug = this.generateSlug(data.title);
        const slugExists = await LearningPathRepository.isSlugTaken(slug, id);
        
        if (slugExists) {
          throw new ValidationError('A learning path with this title already exists');
        }
      }

      const updateData: Prisma.LearningPathUpdateInput = {
        ...data,
        prerequisites: data.prerequisites,
        learningObjectives: data.learningObjectives,
        tags: data.tags,
        skills: data.skills
      };

      return await LearningPathRepository.update(id, updateData);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      console.error('Service error in updateLearningPath:', error);
      throw new DatabaseError('Failed to update learning path');
    }
  }

  async deleteLearningPath(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in deleteLearningPath:', error);
      throw new DatabaseError('Failed to delete learning path');
    }
  }

  async publishLearningPath(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.updateStatus(id, 'PUBLISHED');
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in publishLearningPath:', error);
      throw new DatabaseError('Failed to publish learning path');
    }
  }

  async archiveLearningPath(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.updateStatus(id, 'ARCHIVED');
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in archiveLearningPath:', error);
      throw new DatabaseError('Failed to archive learning path');
    }
  }

  async draftLearningPath(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.updateStatus(id, 'DRAFT');
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Service error in draftLearningPath:', error);
      throw new DatabaseError('Failed to set learning path to draft');
    }
  }

  async getFeaturedLearningPaths(limit: number = 10): Promise<LearningPath[]> {
    try {
      const { learningPaths } = await LearningPathRepository.findAll({
        page: 1,
        limit: Math.min(limit, 50), 
        isFeatured: true,
        status: 'PUBLISHED',
        sortBy: 'featuredOrder',
        sortOrder: 'asc'
      });

      return learningPaths;
    } catch (error) {
      console.error('Service error in getFeaturedLearningPaths:', error);
      return [];
    }
  }

async getLearningPathsByCategory(category: string, limit: number = 10): Promise<LearningPath[]> {
  try {
    console.log(' Service: getLearningPathsByCategory called');
    console.log(' Service Parameters:', { category, limit });

    if (!category || category.trim().length === 0) {
      throw new ValidationError('Category is required');
    }

    const cleanedCategory = category.trim();
    console.log(' Service: Cleaned category:', `"${cleanedCategory}"`);

    const queryParams = {
      page: 1,
      limit: Math.min(limit, 50), 
      category: cleanedCategory,
      status: 'PUBLISHED' as LearningPathStatus,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const
    };

    console.log('Service: Query params for repository:', queryParams);

    const result = await LearningPathRepository.findAll(queryParams);
    
    console.log(' Service: Repository result:', {
      learningPathsCount: result.learningPaths.length,
      total: result.total,
      learningPaths: result.learningPaths.map(p => ({ id: p.id, title: p.title, category: p.category, status: p.status }))
    });

    if (result.learningPaths.length === 0) {
      console.log(' Service: No learning paths found. Let me check why...');
      
      const allCategories = await prisma.learningPath.findMany({
        select: { category: true },
        distinct: ['category']
      });
      console.log('Service: All available categories:', allCategories.map(c => c.category));
      
      const publishedCount = await prisma.learningPath.count({
        where: { status: 'PUBLISHED' }
      });
      console.log('📋 Service: Total published learning paths:', publishedCount);
    }

    return result.learningPaths;
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error('Service: Unexpected error in getLearningPathsByCategory:', error);
    console.error('Service: Error details:', {
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}

  async incrementEnrollmentCount(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.incrementEnrollmentCount(id);
    } catch (error) {
      console.error('Service error in incrementEnrollmentCount:', error);
      throw new DatabaseError('Failed to increment enrollment count');
    }
  }

  async incrementCompletionCount(id: string): Promise<LearningPath> {
    try {
      await this.getLearningPathById(id);
      return await LearningPathRepository.incrementCompletionCount(id);
    } catch (error) {
      console.error('Service error in incrementCompletionCount:', error);
      throw new DatabaseError('Failed to increment completion count');
    }
  }

  // DEBUG
  async debugService(): Promise<any> {
    return await LearningPathRepository.debugDatabaseState();
  }

  // PRIVATE UTILITY
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}