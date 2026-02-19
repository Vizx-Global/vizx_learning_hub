import { UserRepository } from '../repositories/user.repository';
import { BcryptUtil } from '../utils/bcrypt.util';
import { JWTUtil, TokenPayload } from '../utils/jwt.util';
import { UserRole, UserStatus, ActivityType } from '@prisma/client';
import prisma from '../database';
import { EmailService } from '../utils/email.utils';
import { NotificationService } from './notification.service';
import crypto from 'crypto';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    role: string;
    status: string;
    departmentId?: string;
    department?: any;
    jobTitle?: string;
    mustChangePassword: boolean;
    emailVerified: boolean;
    avatar?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthError extends Error {
  constructor(message: string, public readonly data?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  static async registerAdmin(userData: any): Promise<AuthResponse> {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      throw new AuthError('System already has an administrator.');
    }

    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError('User with this email already exists');
    }

    if (userData.employeeId) {
      const existingEmployee = await UserRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new AuthError('Employee ID already exists');
      }
    }

    const hashedPassword = await BcryptUtil.hashPassword(userData.password);
    // Ensure System Administrator department exists
    let systemAdminDept = await prisma.department.findUnique({ where: { name: 'System Administrator' } });
    if (!systemAdminDept) {
      systemAdminDept = await prisma.department.create({
        data: { name: 'System Administrator', description: 'Default department for system administrators' }
      });
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        mustChangePassword: false,
        department: {
          connect: { id: systemAdminDept.id }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        avatar: true,
        departmentId: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    await EmailService.sendEmployeeWelcomeEmail(user.email, user.firstName, userData.password);

    // Send in-app notification
    await NotificationService.notifyWelcome(user.id, user.firstName);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'admin.registered',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });

    return {
      user: {
        ...user,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        avatar: user.avatar || undefined,
        employeeId: user.employeeId || undefined,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  static async register(userData: any): Promise<AuthResponse> {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError('User with this email already exists');
    }

    if (userData.employeeId) {
      const existingEmployee = await UserRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new AuthError('Employee ID already exists');
      }
    }

    const hashedPassword = await BcryptUtil.hashPassword(userData.password);

    // Handle department relation
    let departmentConnect = {};
    if (userData.department) {
      const dept = await prisma.department.findUnique({ where: { name: userData.department } });
      if (dept) {
        departmentConnect = { department: { connect: { id: dept.id } } };
      } else {
         // Create the department if it doesn't exist (optional, or throw error)
         // For now, let's create it to be safe for the "System Administrator" case or others
         const newDept = await prisma.department.create({ data: { name: userData.department } });
         departmentConnect = { department: { connect: { id: newDept.id } } };
      }
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        status: UserStatus.VERIFICATION_PENDING,
        emailVerified: false,
        mustChangePassword: false,
        ...departmentConnect
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        avatar: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        totalPoints: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    await this.sendVerificationCode(user.id);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.registered',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });

    return {
      user: {
        ...user,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        avatar: user.avatar || undefined,
        employeeId: user.employeeId || undefined,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    switch (user.status) {
      case UserStatus.INACTIVE:
        throw new AuthError('Account is inactive.');
      case UserStatus.SUSPENDED:
        throw new AuthError('Account is suspended.');
      case UserStatus.VERIFICATION_PENDING:
        await this.sendVerificationCode(user.id);
        throw new AuthError('Email verification is required. A new code has been sent.');
      case UserStatus.PENDING:
        throw new AuthError('Account is pending approval.');
    }

    const isPasswordValid = await BcryptUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password');
    }

    /* 
    if (user.mustChangePassword) {
      throw new AuthError('Password change required.');
    }
    */

    const isFirstLogin = !user.lastLoginAt;

    await UserRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastActiveDate: new Date(),
    });

    if (isFirstLogin) {
      await EmailService.sendWelcomeEmail(user.email, user.firstName);
      await NotificationService.notifyWelcome(user.id, user.firstName);
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: ActivityType.USER_LOGIN,
        description: 'User logged into the system',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId || undefined,
        role: user.role as string,
        status: user.status as string,
        departmentId: user.departmentId || undefined,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        mustChangePassword: user.mustChangePassword,
        emailVerified: user.emailVerified,
        avatar: user.avatar || undefined,
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  static async createUserByAdmin(userData: any, adminId: string): Promise<any> {
    const admin = await UserRepository.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthError('Only administrators can create users');
    }

    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AuthError('User already exists');
    }

    const passwordToUse = userData.password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(passwordToUse);

      const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        mustChangePassword: true,
        emailVerified: true,
        creator: { connect: { id: adminId } },
        department: userData.department ? {
            connectOrCreate: {
                where: { name: userData.department },
                create: { name: userData.department }
            }
        } : undefined
      },
    });

    await EmailService.sendEmployeeWelcomeEmail(user.email, user.firstName, passwordToUse);

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'user.created',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });

    return { ...user, temporaryPassword: passwordToUse };
  }

  static async createEmployeeByManager(userData: any, managerId: string): Promise<any> {
    const manager = await UserRepository.findById(managerId);
    if (!manager || manager.role !== UserRole.MANAGER) {
      throw new AuthError('Only managers can create employees');
    }

    if (userData.department && userData.department !== manager.department) {
      throw new AuthError('Cannot create employee in a different department');
    }

    const passwordToUse = userData.password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(passwordToUse);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        managerId: manager.id,
        mustChangePassword: true,
        emailVerified: true,
        creator: { connect: { id: managerId } },
         department: {
            connect: { name: manager.department } // Manager's department name must exist if manager exists
         }
      },
    });

    await EmailService.sendEmployeeWelcomeEmail(user.email, user.firstName, passwordToUse);

    await prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'employee.created',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });

    return { ...user, temporaryPassword: passwordToUse };
  }

  static async sendVerificationCode(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.emailVerification.upsert({
      where: { userId },
      update: { code: verificationCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 },
      create: { userId, code: verificationCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    await EmailService.sendVerificationCode(user.email, user.firstName, verificationCode);

    if (user.status !== UserStatus.VERIFICATION_PENDING) {
      await UserRepository.update(user.id, { status: UserStatus.VERIFICATION_PENDING });
    }
  }

  static async verifyEmail(userId: string, code: string): Promise<void> {
    const verification = await prisma.emailVerification.findUnique({ where: { userId } });

    if (!verification || verification.expiresAt < new Date() || verification.attempts >= 5 || verification.code !== code) {
      if (verification && verification.code !== code) {
        await prisma.emailVerification.update({ where: { userId }, data: { attempts: verification.attempts + 1 } });
      }
      throw new AuthError('Invalid or expired verification code');
    }

    const user = await UserRepository.findById(userId);
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, emailVerifiedAt: new Date(), status: UserStatus.ACTIVE },
    });

    await prisma.emailVerification.delete({ where: { userId } });

    await prisma.activity.create({
      data: { userId, type: ActivityType.EMAIL_VERIFIED, description: 'Email verified successfully' },
    });
  }

  static async resendVerificationCode(userId: string): Promise<void> {
    await this.sendVerificationCode(userId);
  }

  private static async generateVerificationCode(userId: string): Promise<string> {
    const verification = await prisma.emailVerification.findUnique({ where: { userId } });
    return verification?.code || 'N/A';
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user || !await BcryptUtil.comparePassword(currentPassword, user.password)) {
      throw new AuthError('Invalid credentials');
    }

    const hashedNewPassword = await BcryptUtil.hashPassword(newPassword);
    await UserRepository.updatePassword(userId, hashedNewPassword);
    await UserRepository.update(userId, { mustChangePassword: false, passwordChangedAt: new Date() });
    await this.logout(userId);
  }

  static async forceChangePassword(userId: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user || !user.mustChangePassword) {
      throw new AuthError('Action not allowed');
    }

    const hashedNewPassword = await BcryptUtil.hashPassword(newPassword);
    await UserRepository.updatePassword(userId, hashedNewPassword);
    await UserRepository.update(userId, { mustChangePassword: false, passwordChangedAt: new Date() });
  }

  static async resetPasswordByAdmin(userId: string, adminId: string): Promise<void> {
    const admin = await UserRepository.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new AuthError('Action not allowed');
    }

    const user = await UserRepository.findById(userId);
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(tempPassword);

    await UserRepository.updatePassword(userId, hashedPassword);
    await UserRepository.update(userId, { mustChangePassword: true, passwordChangedAt: new Date() });
    await EmailService.sendCredentialsEmail(user!.email, user!.firstName, tempPassword);
  }

  static async requestPasswordReset(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    await EmailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
  }

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);
      const session = await prisma.session.findFirst({
        where: { userId: decoded.userId, token: refreshToken, expiresAt: { gt: new Date() } },
      });

      if (!session) throw new AuthError('Invalid refresh token');

      const tokenPayload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        employeeId: decoded.employeeId,
      };

      const newAccessToken = JWTUtil.generateAccessToken(tokenPayload);
      const newRefreshToken = JWTUtil.generateRefreshToken(tokenPayload);

      await prisma.session.update({
        where: { id: session.id },
        data: { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      throw new AuthError(error.message || 'Token refresh failed');
    }
  }

  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { userId, token: refreshToken } });
    } else {
      await prisma.session.deleteMany({ where: { userId } });
    }
  }

  private static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prisma.session.create({
      data: { userId, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
  }

  static async getSubordinates(managerId: string): Promise<any[]> {
    return await UserRepository.getSubordinates(managerId);
  }

  static async getAllUsersWithPermissions(requesterId: string, filters: any = {}): Promise<any> {
    const requester = await UserRepository.findById(requesterId);
    if (!requester) throw new AuthError('User not found');

    if (requester.role === UserRole.MANAGER) {
      filters.department = requester.department;
      filters.role = { notIn: [UserRole.MANAGER, UserRole.ADMIN] };
    } else if (requester.role === UserRole.EMPLOYEE) {
      filters.id = requesterId;
    }

    return await UserRepository.getAllUsers(filters.page || 1, filters.limit || 10, filters);
  }

  static async deactivateUser(userId: string, deactivatedById: string): Promise<void> {
    const deactivator = await UserRepository.findById(deactivatedById);
    const user = await UserRepository.findById(userId);

    if (deactivator!.role === UserRole.MANAGER && (user!.role !== UserRole.EMPLOYEE || user!.department !== deactivator!.department)) {
      throw new AuthError('Permission denied');
    }

    await UserRepository.update(userId, { status: UserStatus.INACTIVE });
    await this.logout(userId);
  }
}