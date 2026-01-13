// module.repository.ts
import { PrismaClient, Module, DifficultyLevel, ContentType, Prisma } from '@prisma/client';
import { DatabaseError } from '../utils/error-handler';
import prisma from '../database';

export interface ModuleWithLearningPath extends Module {
  learningPath: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface ModuleFilters {
  learningPathId?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
  search?: string;
  contentType?: ContentType;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ModulesResponse {
  modules: ModuleWithLearningPath[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ModuleRepository {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;
  private static readonly DEFAULT_SORT = 'orderIndex';
  private static readonly DEFAULT_ORDER = 'asc';

  /**
   * Create a new module with automatic order index assignment
   */
  static async create(data: Prisma.ModuleCreateInput): Promise<Module> {
    try {
      console.log('📝 Repository: Creating module with data:', {
        title: data.title,
        learningPathId: data.learningPath?.connect?.id,
        contentType: data.contentType
      });

      const learningPathId = data.learningPath?.connect?.id;
      if (!learningPathId) {
        throw new DatabaseError('Learning path ID is required');
      }

      // Generate slug from title
      const slug = this.generateSlug(data.title as string);

      // Check for duplicate slug in the same learning path
      await this.validateUniqueSlug(learningPathId, slug);

      // Calculate automatic order index if not provided
      const orderIndex = data.orderIndex !== undefined 
        ? data.orderIndex 
        : await this.getNextOrderIndex(learningPathId);

      const moduleData: Prisma.ModuleCreateInput = {
        ...data,
        slug,
        orderIndex,
        // Ensure content is properly handled based on content type
        content: this.sanitizeContent(data.content, data.contentType as ContentType)
      };

      const module = await prisma.module.create({
        data: moduleData
      });

      console.log('✅ Repository: Module created successfully:', module.id);
      return module;
    } catch (error: any) {
      console.error('❌ Repository: Error creating module:', error);

      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target?.includes('slug')) {
          throw new DatabaseError('Module with this slug already exists in this learning path', error);
        }
        if (target?.includes('title')) {
          throw new DatabaseError('Module with this title already exists', error);
        }
        throw new DatabaseError('Module with these details already exists', error);
      }
      
      if (error.code === 'P2003') {
        throw new DatabaseError('Invalid learning path reference', error);
      }

      // Re-throw our custom errors
      if (error instanceof DatabaseError) {
        throw error;
      }

      throw new DatabaseError('Failed to create module', error);
    }
  }

  /**
   * Find module by ID with learning path details
   */
  static async findById(id: string): Promise<ModuleWithLearningPath | null> {
    try {
      console.log('🔍 Repository: Finding module by ID:', id);

      if (!id) {
        throw new DatabaseError('Module ID is required');
      }

      const module = await prisma.module.findUnique({
        where: { id },
        include: {
          learningPath: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });

      console.log('📋 Repository: Module found:', module ? 'Yes' : 'No');
      return module;
    } catch (error) {
      console.error('❌ Repository: Error finding module by ID:', error);
      throw new DatabaseError('Failed to find module by ID', error);
    }
  }

  /**
   * Find module by learning path ID and slug
   */
  static async findByLearningPathAndSlug(learningPathId: string, slug: string): Promise<Module | null> {
    try {
      if (!learningPathId || !slug) {
        throw new DatabaseError('Learning path ID and slug are required');
      }

      return await prisma.module.findFirst({
        where: {
          learningPathId,
          slug
        }
      });
    } catch (error) {
      console.error('❌ Repository: Error finding module by learning path and slug:', error);
      throw new DatabaseError('Failed to find module by learning path and slug', error);
    }
  }

  /**
   * Find all modules with filtering, pagination, and sorting
   */
  static async findAll(
    filters: ModuleFilters = {},
    pagination: PaginationParams = {
      page: this.DEFAULT_PAGE,
      limit: this.DEFAULT_LIMIT,
      sortBy: this.DEFAULT_SORT,
      sortOrder: this.DEFAULT_ORDER
    }
  ): Promise<ModulesResponse> {
    try {
      console.log('🔍 Repository: Finding modules with filters:', filters, 'pagination:', pagination);

      const {
        page = this.DEFAULT_PAGE,
        limit = this.DEFAULT_LIMIT,
        sortBy = this.DEFAULT_SORT,
        sortOrder = this.DEFAULT_ORDER
      } = pagination;

      const validatedLimit = Math.min(Math.max(1, limit), this.MAX_LIMIT);
      const validatedPage = Math.max(1, page);
      const skip = (validatedPage - 1) * validatedLimit;

      const where = this.buildWhereClause(filters);

      console.log('📋 Repository: Final where clause:', JSON.stringify(where, null, 2));

      const [modules, total] = await Promise.all([
        prisma.module.findMany({
          where,
          skip,
          take: validatedLimit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            learningPath: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }),
        prisma.module.count({ where })
      ]);

      const totalPages = Math.ceil(total / validatedLimit);

      console.log(`📊 Repository: Found ${modules.length} modules out of ${total} total, ${totalPages} pages`);

      return {
        modules,
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages
      };
    } catch (error) {
      console.error('❌ Repository: Error finding modules:', error);
      throw new DatabaseError('Failed to find modules', error);
    }
  }

  /**
   * Update module with automatic slug regeneration if title changes
   */
  static async update(id: string, data: Prisma.ModuleUpdateInput): Promise<ModuleWithLearningPath> {
    try {
      console.log('🔧 Repository: Updating module:', id, 'with data:', data);

      // Verify module exists first
      const existingModule = await this.findById(id);
      if (!existingModule) {
        throw new DatabaseError('Module not found');
      }

      // Regenerate slug if title is being updated
      if (data.title && typeof data.title === 'string') {
        const newSlug = this.generateSlug(data.title);
        
        // Check if new slug would conflict with existing modules
        if (newSlug !== existingModule.slug) {
          await this.validateUniqueSlug(existingModule.learningPathId, newSlug, id);
          data.slug = newSlug;
        }
      }

      // Sanitize content based on content type
      if (data.content !== undefined) {
        const contentType = data.contentType as ContentType || existingModule.contentType;
        data.content = this.sanitizeContent(data.content, contentType);
      }

      const updatedModule = await prisma.module.update({
        where: { id },
        data,
        include: {
          learningPath: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });

      console.log('✅ Repository: Module updated successfully');
      return updatedModule;
    } catch (error: any) {
      console.error('❌ Repository: Error updating module:', error);

      if (error.code === 'P2025') {
        throw new DatabaseError('Module not found', error);
      }

      if (error.code === 'P2002') {
        throw new DatabaseError('Module with this slug already exists in this learning path', error);
      }

      throw new DatabaseError('Failed to update module', error);
    }
  }

  /**
   * Delete module and automatically reorder remaining modules
   */
  static async delete(id: string): Promise<Module> {
    try {
      console.log('🗑️ Repository: Deleting module:', id);

      // Get module details before deletion for reordering
      const moduleToDelete = await prisma.module.findUnique({
        where: { id },
        select: {
          id: true,
          learningPathId: true,
          orderIndex: true
        }
      });

      if (!moduleToDelete) {
        throw new DatabaseError('Module not found');
      }

      // Delete the module
      const deletedModule = await prisma.module.delete({
        where: { id }
      });

      // Reorder remaining modules in the learning path
      await this.reorderModules(moduleToDelete.learningPathId);

      console.log('✅ Repository: Module deleted and modules reordered successfully');
      return deletedModule;
    } catch (error: any) {
      console.error('❌ Repository: Error deleting module:', error);

      if (error.code === 'P2025') {
        throw new DatabaseError('Module not found', error);
      }

      throw new DatabaseError('Failed to delete module', error);
    }
  }

  /**
   * Update module order index and maintain consistency
   */
  static async updateOrderIndex(id: string, orderIndex: number): Promise<Module> {
    try {
      console.log('🔢 Repository: Updating module order:', id, 'to:', orderIndex);

      if (orderIndex < 0) {
        throw new DatabaseError('Order index must be non-negative');
      }

      // Verify module exists
      const existingModule = await prisma.module.findUnique({
        where: { id },
        select: { learningPathId: true, orderIndex: true }
      });

      if (!existingModule) {
        throw new DatabaseError('Module not found');
      }

      // Update the order index
      const updatedModule = await prisma.module.update({
        where: { id },
        data: { orderIndex }
      });

      // If order index changed significantly, reorder all modules
      if (Math.abs(existingModule.orderIndex - orderIndex) > 1) {
        await this.reorderModules(existingModule.learningPathId);
      }

      return updatedModule;
    } catch (error: any) {
      console.error('❌ Repository: Error updating module order:', error);
      throw new DatabaseError('Failed to update module order', error);
    }
  }

  /**
   * Find all modules by learning path ID, ordered by orderIndex
   */
  static async findByLearningPathId(learningPathId: string): Promise<ModuleWithLearningPath[]> {
    try {
      console.log('🔍 Repository: Finding modules by learning path:', learningPathId);

      if (!learningPathId) {
        throw new DatabaseError('Learning path ID is required');
      }

      const modules = await prisma.module.findMany({
        where: { learningPathId },
        orderBy: { orderIndex: 'asc' },
        include: {
          learningPath: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });

      console.log(`📋 Repository: Found ${modules.length} modules for learning path`);
      return modules;
    } catch (error) {
      console.error('❌ Repository: Error finding modules by learning path:', error);
      throw new DatabaseError('Failed to find modules by learning path', error);
    }
  }

  /**
   * Count modules by learning path ID
   */
  static async countByLearningPathId(learningPathId: string): Promise<number> {
    try {
      console.log('🔢 Repository: Counting modules for learning path:', learningPathId);

      if (!learningPathId) {
        throw new DatabaseError('Learning path ID is required');
      }

      const count = await prisma.module.count({
        where: { learningPathId }
      });

      console.log(`📊 Repository: Found ${count} modules for learning path ${learningPathId}`);
      return count;
    } catch (error: any) {
      console.error('❌ Repository: Error counting modules by learning path:', error);
      throw new DatabaseError('Failed to count modules by learning path', error);
    }
  }

  /**
   * Bulk update module orders
   */
  static async bulkUpdateOrders(updates: Array<{ id: string; orderIndex: number }>): Promise<Module[]> {
    try {
      console.log('🔢 Repository: Bulk updating orders for', updates.length, 'modules');

      const updatePromises = updates.map(update =>
        prisma.module.update({
          where: { id: update.id },
          data: { orderIndex: update.orderIndex }
        })
      );

      const results = await Promise.all(updatePromises);
      console.log('✅ Repository: Bulk order update completed successfully');
      return results;
    } catch (error: any) {
      console.error('❌ Repository: Error in bulk update orders:', error);
      throw new DatabaseError('Failed to bulk update module orders', error);
    }
  }

  /**
   * Get modules by content type
   */
  static async findByContentType(contentType: ContentType, learningPathId?: string): Promise<ModuleWithLearningPath[]> {
    try {
      console.log(`🔍 Repository: Finding ${contentType} modules`, learningPathId ? `for learning path: ${learningPathId}` : '');

      const where: any = { contentType };
      if (learningPathId) {
        where.learningPathId = learningPathId;
      }

      const modules = await prisma.module.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        include: {
          learningPath: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });

      console.log(`📋 Repository: Found ${modules.length} ${contentType} modules`);
      return modules;
    } catch (error) {
      console.error(`❌ Repository: Error finding ${contentType} modules:`, error);
      throw new DatabaseError(`Failed to find ${contentType} modules`, error);
    }
  }

  /**
   * Get the next available order index for a learning path
   */
  private static async getNextOrderIndex(learningPathId: string): Promise<number> {
    try {
      const lastModule = await prisma.module.findFirst({
        where: { learningPathId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });

      return lastModule ? lastModule.orderIndex + 1 : 0;
    } catch (error) {
      console.error('❌ Repository: Error getting next order index:', error);
      // Return 0 as fallback
      return 0;
    }
  }

  /**
   * Reorder all modules in a learning path to maintain sequential order indexes
   */
  private static async reorderModules(learningPathId: string): Promise<void> {
    try {
      console.log('🔢 Repository: Reordering modules for learning path:', learningPathId);

      const modules = await prisma.module.findMany({
        where: { learningPathId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true }
      });

      // Update order indexes sequentially starting from 0
      const updatePromises = modules.map((module, index) =>
        prisma.module.update({
          where: { id: module.id },
          data: { orderIndex: index }
        })
      );

      await Promise.all(updatePromises);
      console.log(`✅ Repository: Successfully reordered ${modules.length} modules`);
    } catch (error) {
      console.error('❌ Repository: Error reordering modules:', error);
      throw new DatabaseError('Failed to reorder modules', error);
    }
  }

  /**
   * Validate that slug is unique within the learning path
   */
  private static async validateUniqueSlug(learningPathId: string, slug: string, excludeModuleId?: string): Promise<void> {
    const where: any = {
      learningPathId,
      slug
    };

    if (excludeModuleId) {
      where.id = { not: excludeModuleId };
    }

    const existingModule = await prisma.module.findFirst({ where });

    if (existingModule) {
      throw new DatabaseError(`Module with slug '${slug}' already exists in this learning path`);
    }
  }

  /**
   * Build where clause for filtering
   */
  private static buildWhereClause(filters: ModuleFilters): Prisma.ModuleWhereInput {
    const where: Prisma.ModuleWhereInput = {};

    if (filters.learningPathId) {
      where.learningPathId = filters.learningPathId;
    }

    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  /**
   * Sanitize content based on content type
   * For non-text content types, content can be null if no specific content is provided
   */
  private static sanitizeContent(content: any, contentType: ContentType): string | null {
    if (content === null || content === undefined) {
      return null;
    }

    // For non-text content types, content is optional
    if (contentType !== 'TEXT' && !content) {
      return null;
    }

    return String(content);
  }

  /**
   * Generate URL-friendly slug from title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
      .substring(0, 100);           // Limit length
  }

  /**
   * Health check for repository
   */
  static async healthCheck(): Promise<{ status: string; database: boolean; timestamp: string }> {
    try {
      // Test database connection
      await prisma.module.count();
      
      return {
        status: 'healthy',
        database: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Repository: Health check failed:', error);
      return {
        status: 'unhealthy',
        database: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}