import { Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { departmentValidators } from '../validator/department.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';
import { SuccessResponse } from '../utils/response.util';
import { asyncHandler } from '../utils/asyncHandler';

export class DepartmentController {
  createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validateRequest(departmentValidators.createDepartmentSchema, req.body) as any;
    const department = await DepartmentService.createDepartment(data);

    return new SuccessResponse(
      'Department created successfully',
      department,
      201
    ).send(res);
  });

  getAllDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = validateRequest(departmentValidators.queryDepartmentSchema, req.query) as any;
    const result = await DepartmentService.getAllDepartments(query);

    return new SuccessResponse(
      'Departments retrieved successfully',
      result
    ).send(res);
  });

  getDepartmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const department = await DepartmentService.getDepartmentById(id);

    return new SuccessResponse(
      'Department retrieved successfully',
      department
    ).send(res);
  });

  updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = validateRequest(departmentValidators.updateDepartmentSchema, req.body) as any;
    const department = await DepartmentService.updateDepartment(id, data);

    return new SuccessResponse(
      'Department updated successfully',
      department
    ).send(res);
  });

  deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await DepartmentService.deleteDepartment(id);

    return new SuccessResponse(
      'Department deleted successfully'
    ).send(res);
  });

  getDepartmentPerformance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const stats = await DepartmentService.getDepartmentPerformance(id);

    return new SuccessResponse(
      'Department performance stats retrieved successfully',
      stats
    ).send(res);
  });

  getDepartmentRankings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const rankings = await DepartmentService.getRanking(limit);

    return new SuccessResponse(
      'Department rankings retrieved successfully',
      rankings
    ).send(res);
  });
}
