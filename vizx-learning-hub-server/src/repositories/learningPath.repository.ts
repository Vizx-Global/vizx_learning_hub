import { PrismaClient, LearningPath, LearningPathStatus, DifficultyLevel, Prisma } from '@prisma/client';
import { DatabaseError } from '../utils/error-handler';
import prisma from '../database'; 

export class LearningPathRepository {

  static async create(data: Prisma.LearningPathCreateInput): Promise<LearningPath> {
    try {
      const slug = this.generateSlug(data.title);
      
      return await prisma.learningPath.create({
        data: {
          ...data as any,
          slug,
          source: data.source || 'CUSTOM',
          status: data.status || 'DRAFT',
          provider: data.provider || 'Internal',
          enrollmentCount: data.enrollmentCount || 0,
          completionCount: data.completionCount || 0,
          ratingCount: data.ratingCount || 0,
        },
        include: {
          categoryRef: true,
          subcategoryRef: true
        }
      });
    } catch (error: any) {
      console.error('Database error in create learning path:', error);
      if (error.code === 'P2002') {
        throw new DatabaseError('Learning path with this title or slug already exists', error);
      }
      if (error.code === 'P2003') {
        throw new DatabaseError('Invalid user reference', error);
      }
      
      throw new DatabaseError(`Failed to create learning path: ${error.message}`, error);
    }
  }

  static async findById(id: string): Promise<LearningPath | null> {
    try {
      return await prisma.learningPath.findUnique({
        where: { id },
        include: {
          categoryRef: true,
          subcategoryRef: true
        }
      });
    } catch (error) {
      console.error('Database error in findById:', error);
      throw new DatabaseError('Failed to find learning path by ID', error);
    }
  }

  static async findBySlug(slug: string): Promise<LearningPath | null> {
    try {
      return await prisma.learningPath.findUnique({
        where: { slug },
        include: {
          categoryRef: true,
          subcategoryRef: true
        }
      });
    } catch (error) {
      console.error('Database error in findBySlug:', error);
      throw new DatabaseError('Failed to find learning path by slug', error);
    }
  }

  static async findAll(params: {
    page: number;
    limit: number;
    category?: string;
    categoryId?: string;
    difficulty?: DifficultyLevel;
    status?: LearningPathStatus;
    isFeatured?: boolean;
    search?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ learningPaths: LearningPath[]; total: number }> {
    try {
      console.log('Repository: Finding learning paths with params:', params);

      const {
        page,
        limit,
        category,
        categoryId,
        difficulty,
        status,
        isFeatured,
        search,
        sortBy,
        sortOrder
      } = params;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (category) {
        where.categoryRef = { name: { contains: category, mode: 'insensitive' } };
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (status) {
        where.status = status;
      }

      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { categoryRef: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      console.log('Repository: Final where clause:', JSON.stringify(where, null, 2));

      const [learningPaths, total] = await Promise.all([
        prisma.learningPath.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            categoryRef: true,
            subcategoryRef: true
          }
        }),
        prisma.learningPath.count({ where })
      ]);

      console.log(`Repository: Found ${learningPaths.length} learning paths out of ${total} total`);

      return { learningPaths, total };
      
    } catch (error: any) {
      console.error('Repository: Database error in findAll:', error);
      console.error('Repository: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      return { learningPaths: [], total: 0 };
    }
  }

  static async update(id: string, data: Prisma.LearningPathUpdateInput): Promise<LearningPath> {
    try {
      if (data.title && typeof data.title === 'string') {
        data.slug = this.generateSlug(data.title);
      }

      return await prisma.learningPath.update({
        where: { id },
        data,
        include: {
          categoryRef: true,
          subcategoryRef: true
        }
      });
    } catch (error: any) {
      console.error('Database error in update:', error);
      
      if (error.code === 'P2025') {
        throw new DatabaseError('Learning path not found', error);
      }
      
      throw new DatabaseError('Failed to update learning path', error);
    }
  }

  static async delete(id: string): Promise<LearningPath> {
    try {
      return await prisma.learningPath.delete({
        where: { id }
      });
    } catch (error: any) {
      console.error('Database error in delete:', error);
      
      if (error.code === 'P2025') {
        throw new DatabaseError('Learning path not found', error);
      }
      
      throw new DatabaseError('Failed to delete learning path', error);
    }
  }

  static async updateStatus(id: string, status: LearningPathStatus): Promise<LearningPath> {
    try {
      const data: any = { status };

      if (status === 'PUBLISHED') {
        data.publishedAt = new Date();
      }

      return await prisma.learningPath.update({
        where: { id },
        data
      });
    } catch (error: any) {
      console.error('Database error in updateStatus:', error);
      
      if (error.code === 'P2025') {
        throw new DatabaseError('Learning path not found', error);
      }
      
      throw new DatabaseError('Failed to update learning path status', error);
    }
  }

  // COUNTERS
  static async incrementEnrollmentCount(id: string): Promise<LearningPath> {
    try {
      return await prisma.learningPath.update({
        where: { id },
        data: {
          enrollmentCount: { increment: 1 }
        }
      });
    } catch (error: any) {
      console.error('Database error in incrementEnrollmentCount:', error);
      throw new DatabaseError('Failed to increment enrollment count', error);
    }
  }

  static async incrementCompletionCount(id: string): Promise<LearningPath> {
    try {
      return await prisma.learningPath.update({
        where: { id },
        data: {
          completionCount: { increment: 1 }
        }
      });
    } catch (error: any) {
      console.error('Database error in incrementCompletionCount:', error);
      throw new DatabaseError('Failed to increment completion count', error);
    }
  }

  static async updateRating(id: string, averageRating: number, ratingCount: number): Promise<LearningPath> {
    try {
      return await prisma.learningPath.update({
        where: { id },
        data: {
          averageRating,
          ratingCount
        }
      });
    } catch (error: any) {
      console.error('Database error in updateRating:', error);
      throw new DatabaseError('Failed to update learning path rating', error);
    }
  }

  // UTILITY METHODS
  static async exists(id: string): Promise<boolean> {
    try {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id },
        select: { id: true }
      });
      return !!learningPath;
    } catch (error) {
      console.error('Database error in exists check:', error);
      return false;
    }
  }

  static async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const learningPath = await prisma.learningPath.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } })
        },
        select: { id: true }
      });
      return !!learningPath;
    } catch (error) {
      console.error('Database error in slug check:', error);
      return false;
    }
  }

  // DEBUG
  static async debugDatabaseState(): Promise<any> {
    try {
      const totalCount = await prisma.learningPath.count();
      const allPaths = await prisma.learningPath.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          difficulty: true,
          categoryId: true,
          isFeatured: true,
          createdAt: true
        }
      });

      return {
        totalCount,
        samplePaths: allPaths,
        databaseConnected: true
      };
    } catch (error) {
      console.error('Debug database state error:', error);
      return { 
        error: error.message,
        databaseConnected: false
      };
    }
  }

  // PRIVATE UTILITY
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}