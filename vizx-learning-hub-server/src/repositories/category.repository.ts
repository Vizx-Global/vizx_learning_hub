import prisma from '../database';
import slugify from 'slugify';
import { BadRequestError, NotFoundError } from '../utils/error-handler';

export interface CreateCategoryData {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export class CategoryRepository {
  static async create(data: CreateCategoryData) {
    const slug = slugify(data.name, { lower: true, strict: true });
    
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existing) {
      throw new BadRequestError(existing.name === data.name ? 'Category with this name already exists' : 'Category with this name results in a duplicate slug');
    }

    return prisma.category.create({
      data: {
        ...data,
        slug,
      },
      include: {
        subcategories: true,
      },
    });
  }

  static async findAll() {
    return prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            learningPaths: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: {
            _count: {
              select: {
                learningPaths: true,
              },
            },
          },
        },
      },
    });
  }

  static async update(id: string, data: UpdateCategoryData) {
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name, { lower: true, strict: true });
      
      const existing = await prisma.category.findFirst({
        where: {
          OR: [{ name: data.name }, { slug }],
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestError(existing.name === data.name ? 'Category with this name already exists' : 'Category with this name results in a duplicate slug');
      }
      
      updateData.slug = slug;
    }
    return prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        subcategories: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  // --- SubCategory ---

  static async createSubCategory(categoryId: string, data: { name: string; description?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    
    const existing = await prisma.subCategory.findFirst({
      where: {
        categoryId,
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existing) {
      throw new BadRequestError(existing.name === data.name ? 'Sub-category with this name already exists in this category' : 'Sub-category with this name results in a duplicate slug');
    }

    return prisma.subCategory.create({
      data: {
        ...data,
        slug,
        categoryId,
      },
    });
  }

  static async updateSubCategory(id: string, data: { name?: string; description?: string }) {
    const updateData: any = { ...data };
    if (data.name) {
      const slug = slugify(data.name, { lower: true, strict: true });
      
      // Get the categoryId for the subcategory
      const subCategory = await prisma.subCategory.findUnique({ where: { id } });
      if (!subCategory) throw new NotFoundError('Sub-category not found');

      const existing = await prisma.subCategory.findFirst({
        where: {
          categoryId: subCategory.categoryId,
          OR: [{ name: data.name }, { slug }],
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestError(existing.name === data.name ? 'Sub-category with this name already exists in this category' : 'Sub-category with this name results in a duplicate slug');
      }

      updateData.slug = slug;
    }
    return prisma.subCategory.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteSubCategory(id: string) {
    return prisma.subCategory.delete({
      where: { id },
    });
  }

  static async findSubCategoriesByCategoryId(categoryId: string) {
    return prisma.subCategory.findMany({
      where: { categoryId },
      include: {
        _count: {
          select: {
            learningPaths: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
