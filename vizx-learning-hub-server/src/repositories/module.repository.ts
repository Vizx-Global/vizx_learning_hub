import { Module, DifficultyLevel, ContentType, Prisma } from '@prisma/client';
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

  static async create(data: Prisma.ModuleCreateInput): Promise<Module> {
    const learningPathId = data.learningPath?.connect?.id;
    if (!learningPathId) throw new DatabaseError('Learning path ID is required');

    const slug = this.generateSlug(data.title as string);
    await this.validateUniqueSlug(learningPathId, slug);

    const orderIndex = data.orderIndex !== undefined ? data.orderIndex : await this.getNextOrderIndex(learningPathId);
    const moduleData: Prisma.ModuleCreateInput = {
      ...data, slug, orderIndex,
      content: this.sanitizeContent(data.content, data.contentType as ContentType)
    };

    return await prisma.module.create({ data: moduleData });
  }

  static async findById(id: string): Promise<ModuleWithLearningPath | null> {
    if (!id) throw new DatabaseError('Module ID is required');
    return await prisma.module.findUnique({
      where: { id },
      include: { learningPath: { select: { id: true, title: true, slug: true } } }
    });
  }

  static async findByLearningPathAndSlug(learningPathId: string, slug: string): Promise<Module | null> {
    return await prisma.module.findFirst({ where: { learningPathId, slug } });
  }

  static async findAll(filters: ModuleFilters = {}, pagination: PaginationParams = { page: this.DEFAULT_PAGE, limit: this.DEFAULT_LIMIT, sortBy: this.DEFAULT_SORT, sortOrder: this.DEFAULT_ORDER }): Promise<ModulesResponse> {
    const limit = Math.min(Math.max(1, pagination.limit), this.MAX_LIMIT);
    const page = Math.max(1, pagination.page);
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [modules, total] = await Promise.all([
      prisma.module.findMany({ where, skip, take: limit, orderBy: { [pagination.sortBy]: pagination.sortOrder }, include: { learningPath: { select: { id: true, title: true, slug: true } } } }),
      prisma.module.count({ where })
    ]);

    return { modules, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async update(id: string, data: Prisma.ModuleUpdateInput): Promise<ModuleWithLearningPath> {
    const existing = await this.findById(id);
    if (!existing) throw new DatabaseError('Module not found');

    if (data.title && typeof data.title === 'string') {
      const newSlug = this.generateSlug(data.title);
      if (newSlug !== existing.slug) {
        await this.validateUniqueSlug(existing.learningPathId, newSlug, id);
        data.slug = newSlug;
      }
    }

    if (data.content !== undefined) {
      data.content = this.sanitizeContent(data.content, (data.contentType as ContentType) || existing.contentType);
    }

    return await prisma.module.update({ where: { id }, data, include: { learningPath: { select: { id: true, title: true, slug: true } } } });
  }

  static async delete(id: string): Promise<Module> {
    const m = await prisma.module.findUnique({ where: { id }, select: { learningPathId: true } });
    if (!m) throw new DatabaseError('Module not found');
    const deleted = await prisma.module.delete({ where: { id } });
    await this.reorderModules(m.learningPathId);
    return deleted;
  }

  static async updateOrderIndex(id: string, orderIndex: number): Promise<Module> {
    if (orderIndex < 0) throw new DatabaseError('Order index must be non-negative');
    const m = await prisma.module.findUnique({ where: { id }, select: { learningPathId: true, orderIndex: true } });
    if (!m) throw new DatabaseError('Module not found');

    const updated = await prisma.module.update({ where: { id }, data: { orderIndex } });
    if (Math.abs(m.orderIndex - orderIndex) > 1) await this.reorderModules(m.learningPathId);
    return updated;
  }

  static async findByLearningPathId(learningPathId: string): Promise<ModuleWithLearningPath[]> {
    return await prisma.module.findMany({ where: { learningPathId }, orderBy: { orderIndex: 'asc' }, include: { learningPath: { select: { id: true, title: true, slug: true } } } });
  }

  static async countByLearningPathId(learningPathId: string): Promise<number> {
    return await prisma.module.count({ where: { learningPathId } });
  }

  static async bulkUpdateOrders(updates: Array<{ id: string; orderIndex: number }>): Promise<Module[]> {
    return await Promise.all(updates.map(u => prisma.module.update({ where: { id: u.id }, data: { orderIndex: u.orderIndex } })));
  }

  static async findByContentType(contentType: ContentType, learningPathId?: string): Promise<ModuleWithLearningPath[]> {
    return await prisma.module.findMany({ where: { contentType, ...(learningPathId && { learningPathId }) }, orderBy: { orderIndex: 'asc' }, include: { learningPath: { select: { id: true, title: true, slug: true } } } });
  }

  private static async getNextOrderIndex(learningPathId: string): Promise<number> {
    const last = await prisma.module.findFirst({ where: { learningPathId }, orderBy: { orderIndex: 'desc' }, select: { orderIndex: true } });
    return last ? last.orderIndex + 1 : 0;
  }

  private static async reorderModules(learningPathId: string): Promise<void> {
    const modules = await prisma.module.findMany({ where: { learningPathId }, orderBy: { orderIndex: 'asc' }, select: { id: true } });
    await Promise.all(modules.map((m, i) => prisma.module.update({ where: { id: m.id }, data: { orderIndex: i } })));
  }

  private static async validateUniqueSlug(learningPathId: string, slug: string, excludeId?: string): Promise<void> {
    if (await prisma.module.findFirst({ where: { learningPathId, slug, ...(excludeId && { id: { not: excludeId } }) } })) {
      throw new DatabaseError(`Slug '${slug}' already exists in this path`);
    }
  }

  private static buildWhereClause(f: ModuleFilters): Prisma.ModuleWhereInput {
    const w: Prisma.ModuleWhereInput = {};
    if (f.learningPathId) w.learningPathId = f.learningPathId;
    if (f.category) w.category = { contains: f.category, mode: 'insensitive' };
    if (f.difficulty) w.difficulty = f.difficulty;
    if (f.isActive !== undefined) w.isActive = f.isActive;
    if (f.contentType) w.contentType = f.contentType;
    if (f.search) w.OR = [{ title: { contains: f.search, mode: 'insensitive' } }, { description: { contains: f.search, mode: 'insensitive' } }];
    return w;
  }

  private static sanitizeContent(c: any, type: ContentType): string | null {
    return (c === null || c === undefined || (type !== 'TEXT' && !c)) ? null : String(c);
  }

  private static generateSlug(title: string): string {
    return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 100);
  }

  static async healthCheck() {
    try { await prisma.module.count(); return { status: 'healthy', database: true, timestamp: new Date().toISOString() }; }
    catch { return { status: 'unhealthy', database: false, timestamp: new Date().toISOString() }; }
  }
}