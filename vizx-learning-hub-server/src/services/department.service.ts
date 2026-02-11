import { DepartmentRepository, CreateDepartmentData, UpdateDepartmentData } from '../repositories/department.repository';
import { NotFoundError } from '../utils/error-handler';

export class DepartmentService {
  static async createDepartment(data: CreateDepartmentData) {
    if (data.managerId === '') {
      data.managerId = null;
    }
    return DepartmentRepository.create(data);
  }

  static async getAllDepartments(options: { 
    search?: string; 
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const skip = (options.page - 1) * options.limit;
    const { departments, total } = await DepartmentRepository.findAll({
      search: options.search,
      isActive: options.isActive,
      skip,
      take: options.limit,
    });

    return {
      departments,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit),
      },
    };
  }

  static async getDepartmentById(id: string) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  static async updateDepartment(id: string, data: UpdateDepartmentData) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    
    if (data.managerId === '') {
      data.managerId = null;
    }
    
    return DepartmentRepository.update(id, data);
  }

  static async deleteDepartment(id: string) {
    const department = await DepartmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return DepartmentRepository.delete(id);
  }

  static async getDepartmentPerformance(id: string) {
    const stats = await DepartmentRepository.getDepartmentStats(id);
    if (!stats) {
      throw new NotFoundError('Department not found');
    }
    return stats;
  }

  static async getRanking(limit: number = 10) {
    // This could be a more complex query in the repository, but for now we'll get all active and calculate
    const { departments } = await DepartmentRepository.findAll({ isActive: true, take: 100 });
    
    const rankings = await Promise.all(
      departments.map(async (d) => {
        const stats = await DepartmentRepository.getDepartmentStats(d.id);
        return stats;
      })
    );

    return rankings
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.averagePointsPerUser - a.averagePointsPerUser)
      .slice(0, limit);
  }
}
