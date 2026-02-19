import { Response } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { enrollmentValidators } from '../validator/enrollment.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validateRequest } from '../utils/validation';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor(enrollmentService: EnrollmentService) {
    this.enrollmentService = enrollmentService;
  }

  enrollInPath = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const data = validateRequest(enrollmentValidators.createEnrollmentSchema, req.body) as any;
      const enrollment = await this.enrollmentService.enrollUser(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Successfully enrolled in learning path',
        data: enrollment
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getEnrollment = async (req: AuthRequest, res: Response) => {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user!.userId;
      const enrollment = await this.enrollmentService.getEnrollmentById(enrollmentId, userId);

      return res.json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  getMyEnrollments = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const query = validateRequest(enrollmentValidators.queryEnrollmentSchema, req.query) as any;
      
      // Only admins, managers and content creators can see enrollments in unpublished paths
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MANAGER' && req.user?.role !== 'CONTENT_CREATOR') {
        query.pathStatus = 'PUBLISHED';
      }
      
      const result = await this.enrollmentService.getUserEnrollments(userId, query);

      res.json({
        success: true,
        data: result.enrollments,
        pagination: result.pagination
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateEnrollment = async (req: AuthRequest, res: Response) => {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user!.userId;
      const data = validateRequest(enrollmentValidators.updateEnrollmentSchema, req.body);
      const enrollment = await this.enrollmentService.updateEnrollment(enrollmentId, userId, data);

      res.json({
        success: true,
        message: 'Enrollment updated successfully',
        data: enrollment
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  dropEnrollment = async (req: AuthRequest, res: Response) => {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user!.userId;
      const enrollment = await this.enrollmentService.dropEnrollment(enrollmentId, userId);

      res.json({
        success: true,
        message: 'Successfully dropped enrollment',
        data: enrollment
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getEnrollmentProgress = async (req: AuthRequest, res: Response) => {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user!.userId;
      const progress = await this.enrollmentService.getEnrollmentProgress(enrollmentId, userId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getActiveEnrollmentsCount = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await this.enrollmentService.getActiveEnrollmentsCount(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: any, res: Response) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.name === 'BadRequestError' || error.name === 'ConflictError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}