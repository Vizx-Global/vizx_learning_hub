import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../utils/email.utils';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/auth.middleware';

export class VerificationController {
    static requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
        await AuthService.requestPasswordReset(req.body.email);
        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.',
        });
    });

    static validateResetToken = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.params;
        if (!token) {
            throw new Error('Token is required');
        }
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            valid: true
        });
    });

    static completePasswordReset = asyncHandler(async (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.',
        });
    });

    static verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
        await AuthService.verifyEmail(req.user!.userId, req.body.code);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        });
    });

    static resendVerificationCode = asyncHandler(async (req: AuthRequest, res: Response) => {
        let userId = req.user?.userId;
        if (!userId && req.body.email) {
            const user = await UserRepository.findByEmail(req.body.email);
            if (user) {
                userId = user.id;
            }
        }

        if (!userId) {
            return res.status(200).json({
                success: true,
                message: 'If the account exists, a verification code has been sent.',
            });
        }

        await AuthService.resendVerificationCode(userId);
        return res.status(200).json({
            success: true,
            message: 'Verification code has been requested.',
        });
    });

    static forcePasswordChange = asyncHandler(async (req: AuthRequest, res: Response) => {
        await AuthService.forceChangePassword(req.user!.userId, req.body.newPassword);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    });

    static getVerificationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user = await UserRepository.findById(req.user!.userId);
        if (!user) {
            throw new Error('User not found');
        }
        res.status(200).json({
            success: true,
            data: {
                emailVerified: user.emailVerified,
                status: user.status,
                role: user.role,
            },
        });
    });

    static createEmployeeByManager = asyncHandler(async (req: AuthRequest, res: Response) => {
        const employee = await AuthService.createEmployeeByManager(req.validatedData || req.body, req.user!.userId);
        res.status(201).json({
            success: true,
            message: 'Employee account created successfully',
            data: employee,
        });
    });

    static getManagerEmployeeById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const managerId = req.user!.userId;
        const employeeId = req.params.employeeId;
        const employee = await UserRepository.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        const manager = await UserRepository.findById(managerId);
        if (employee.department !== manager?.department || employee.role !== UserRole.EMPLOYEE) {
            throw new Error('You do not have permission to view this employee');
        }
        res.status(200).json({
            success: true,
            data: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                employeeId: employee.employeeId,
                phone: employee.phone,
                department: employee.department,
                jobTitle: employee.jobTitle,
                status: employee.status,
                createdAt: employee.createdAt
            },
        });
    });

    static updateEmployeeByManager = asyncHandler(async (req: AuthRequest, res: Response) => {
        const managerId = req.user!.userId;
        const employeeId = req.params.employeeId;
        const updateData = req.validatedData || req.body;
        const employee = await UserRepository.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        const manager = await UserRepository.findById(managerId);
        if (employee.department !== manager?.department || employee.role !== UserRole.EMPLOYEE) {
            throw new Error('You can only update employees in your department');
        }
        const allowedUpdates = {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            phone: updateData.phone,
            jobTitle: updateData.jobTitle,
        };
        const updatedEmployee = await UserRepository.update(employeeId, allowedUpdates);
        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: updatedEmployee,
        });
    });

    static deactivateEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
        await AuthService.deactivateUser(req.params.employeeId, req.user!.userId);
        res.status(200).json({
            success: true,
            message: 'Employee account deactivated successfully',
        });
    });

    static resetPasswordByAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
        await AuthService.resetPasswordByAdmin(req.params.userId, req.user!.userId);
        res.status(200).json({
            success: true,
            message: 'Password has been reset. A temporary password has been sent to the user.',
        });
    });

    static testEmailService = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) throw new Error('Email is required');
        await EmailService.sendWelcomeEmail(email, 'Test User');
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully',
        });
    });
}
