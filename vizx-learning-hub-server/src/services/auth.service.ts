import { UserRepository } from '../repositories/user.repository';
import { BcryptUtil } from '../utils/bcrypt.util';
import { JWTUtil, TokenPayload } from '../utils/jwt.util';
import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../database';
import { EmailService } from '../utils/email.utils';
import crypto from 'crypto';
import { config } from '../config';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    role: string;
    status: string;
    department?: string;
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

export class AuthService {
  static async registerAdmin(userData: any): Promise<AuthResponse> {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      throw new Error('System already has an administrator. Please contact the existing admin for access.');
    }
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    if (userData.employeeId) {
      const existingEmployee = await UserRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }

    const hashedPassword = await BcryptUtil.hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        mustChangePassword: false,
        createdBy: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        avatar: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    await EmailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      userData.password,
      UserRole.ADMIN
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'admin.registered',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
        ipAddress: '127.0.0.1',
        userAgent: 'System Registration',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId || undefined,
        role: user.role,
        status: user.status,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        mustChangePassword: user.mustChangePassword,
        emailVerified: user.emailVerified,
        avatar: user.avatar || undefined,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async register(userData: any): Promise<AuthResponse> {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (userData.employeeId) {
      const existingEmployee = await UserRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }

    const hashedPassword = await BcryptUtil.hashPassword(userData.password);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        mustChangePassword: false,
        createdBy: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        avatar: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    await EmailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      userData.password,
      UserRole.EMPLOYEE
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.registered',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
        ipAddress: '127.0.0.1',
        userAgent: 'User Registration',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId || undefined,
        role: user.role,
        status: user.status,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        mustChangePassword: user.mustChangePassword,
        emailVerified: user.emailVerified,
        avatar: user.avatar || undefined,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check account status
    switch (user.status) {
      case UserStatus.INACTIVE:
        throw new Error('Account is inactive. Please contact administrator.');
      case UserStatus.SUSPENDED:
        throw new Error('Account is suspended. Please contact administrator.');
      case UserStatus.VERIFICATION_PENDING:
        if (user.role === UserRole.MANAGER) {
          // Resend verification code for pending managers
          await this.sendVerificationCode(user.id);
          throw new Error('Please verify your email first. Verification code has been resent to your email.');
        }
        break;
      case UserStatus.PENDING:
        throw new Error('Account is pending approval. Please contact administrator.');
    }
    const isPasswordValid = await BcryptUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.mustChangePassword) {

      const tempTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || undefined,
      };

      const tempToken = JWTUtil.generateAccessToken(tempTokenPayload, '1h'); // 1 hour expiry

      throw new Error('Password change required. Please change your password.', {
        cause: {
          requiresPasswordChange: true,
          tempToken,
          userId: user.id,
        }
      });
    }

    // Update last login
    await UserRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastActiveDate: new Date(),
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || undefined,
    };

    const accessToken = JWTUtil.generateAccessToken(tokenPayload);
    const refreshToken = JWTUtil.generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(user.id, refreshToken);

    // Log login activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'USER_LOGIN',
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
        role: user.role,
        status: user.status,
        department: user.department || undefined,
        jobTitle: user.jobTitle || undefined,
        mustChangePassword: user.mustChangePassword,
        emailVerified: user.emailVerified,
        avatar: user.avatar || undefined,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
  static async createUserByAdmin(userData: any, adminId: string): Promise<any> {
    const admin = await UserRepository.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can create new users');
    }
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    if (userData.employeeId) {
      const existingEmployee = await UserRepository.findByEmployeeId(userData.employeeId);
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(tempPassword);

    let status = UserStatus.ACTIVE;
    if (userData.role === UserRole.MANAGER) {
      status = UserStatus.VERIFICATION_PENDING;
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        status,
        mustChangePassword: true,
        emailVerified: userData.role !== UserRole.MANAGER,
        createdBy: adminId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user.role === UserRole.MANAGER) {
      await this.sendVerificationCode(user.id);
      await EmailService.sendManagerWelcomeEmail(
        user.email,
        user.firstName,
        tempPassword,
        await this.generateVerificationCode(user.id)
      );
    } else {
      await EmailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        tempPassword,
        user.role
      );
    }
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'user.created',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });
    await EmailService.sendAdminNotification(
      'New User Created',
      `Created ${user.role.toLowerCase()} account for ${user.firstName} ${user.lastName}`,
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdBy: admin.email,
      }
    );

    return {
      ...user,
      temporaryPassword: tempPassword,
    };
  }
  static async createEmployeeByManager(userData: any, managerId: string): Promise<any> {
    const manager = await UserRepository.findById(managerId);
    if (!manager) {
      throw new Error('Manager not found');
    }

    // Only managers can create employees
    if (manager.role !== UserRole.MANAGER) {
      throw new Error('Only managers can create employees');
    }

    // Managers can only create employees in their own department
    if (userData.department && userData.department !== manager.department) {
      throw new Error('You can only create employees in your own department');
    }

    // Ensure manager's email is verified
    if (!manager.emailVerified) {
      throw new Error('Please verify your email before creating employees');
    }

    // Validate email
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(tempPassword);

    // Create employee
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        department: manager.department, // Force same department as manager
        managerId: manager.id,
        mustChangePassword: true,
        emailVerified: true, // Employees don't need email verification
        createdBy: managerId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        phone: true,
        department: true,
        jobTitle: true,
        role: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send welcome email
    await EmailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      tempPassword,
      UserRole.EMPLOYEE
    );

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: managerId,
        action: 'employee.created',
        entity: 'User',
        entityId: user.id,
        newValue: { ...user, password: '[HIDDEN]' },
      },
    });

    // Send notification to manager
    await EmailService.sendAccountUpdateEmail(
      manager.email,
      manager.firstName,
      'employee_created',
      `You have created an employee account for ${user.firstName} ${user.lastName}`
    );

    return {
      ...user,
      temporaryPassword: tempPassword, // Only returned for manager reference
    };
  }

  // ==================== VERIFICATION SYSTEM ====================

  /**
   * Generate and send verification code to manager
   */
  static async sendVerificationCode(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only managers require email verification
    if (user.role !== UserRole.MANAGER) {
      throw new Error('Only managers require email verification');
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code with expiry (15 minutes)
    await prisma.emailVerification.upsert({
      where: { userId },
      update: {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        attempts: 0,
      },
      create: {
        userId,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Send verification email
    await EmailService.sendVerificationCode(user.email, user.firstName, verificationCode);

    // Update user status if not already pending
    if (user.status !== UserStatus.VERIFICATION_PENDING) {
      await UserRepository.update(user.id, {
        status: UserStatus.VERIFICATION_PENDING,
      });
    }

    // Log the action
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'VERIFICATION_SENT',
        description: 'Verification code sent to email',
      },
    });
  }

  /**
   * Verify email with code
   */
  static async verifyEmail(userId: string, code: string): Promise<void> {
    const verification = await prisma.emailVerification.findUnique({
      where: { userId },
    });

    if (!verification) {
      throw new Error('Verification code not found or expired. Please request a new code.');
    }

    // Check expiry
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({ where: { userId } });
      throw new Error('Verification code has expired. Please request a new code.');
    }

    // Check attempts
    if (verification.attempts >= 5) {
      throw new Error('Too many verification attempts. Please request a new code.');
    }

    // Verify code
    if (verification.code !== code) {
      // Increment attempt count
      await prisma.emailVerification.update({
        where: { userId },
        data: { attempts: verification.attempts + 1 },
      });

      const attemptsLeft = 5 - (verification.attempts + 1);
      throw new Error(`Invalid verification code. ${attemptsLeft} attempts remaining.`);
    }

    // Get user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify user email and activate account
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
      },
    });

    // Delete verification record
    await prisma.emailVerification.delete({
      where: { userId },
    });

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'EMAIL_VERIFIED',
        description: 'Email verified successfully',
      },
    });

    // Send confirmation email
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'profile_updated',
      'Your email has been verified successfully. Your account is now active.'
    );
  }

  /**
   * Resend verification code
   */
  static async resendVerificationCode(userId: string): Promise<void> {
    await this.sendVerificationCode(userId);

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'VERIFICATION_RESENT',
        description: 'Verification code resent to email',
      },
    });
  }

  /**
   * Get verification code (for internal use)
   */
  private static async generateVerificationCode(userId: string): Promise<string> {
    const verification = await prisma.emailVerification.findUnique({
      where: { userId },
    });

    return verification?.code || 'N/A';
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Change password (for logged-in users)
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await BcryptUtil.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!await BcryptUtil.isPasswordValid(newPassword)) {
      throw new Error('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Hash new password
    const hashedNewPassword = await BcryptUtil.hashPassword(newPassword);

    // Update password
    await UserRepository.updatePassword(userId, hashedNewPassword);

    // Update user to indicate password has been changed
    await UserRepository.update(userId, {
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    });

    // Logout all sessions for security
    await this.logout(userId);

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'PASSWORD_CHANGED',
        description: 'Password changed successfully',
      },
    });

    // Send notification email
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'password_changed',
      'Your password was changed successfully.'
    );
  }

  /**
   * Force password change (for users with mustChangePassword = true)
   */
  static async forceChangePassword(userId: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.mustChangePassword) {
      throw new Error('Password change is not required for this user');
    }

    // Validate new password
    if (!await BcryptUtil.isPasswordValid(newPassword)) {
      throw new Error('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Hash new password
    const hashedNewPassword = await BcryptUtil.hashPassword(newPassword);

    // Update password
    await UserRepository.updatePassword(userId, hashedNewPassword);

    // Update user
    await UserRepository.update(userId, {
      mustChangePassword: false,
      passwordChangedAt: new Date(),
    });

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'PASSWORD_CHANGED_FORCED',
        description: 'Password changed after initial setup',
      },
    });

    // Send notification email
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'password_changed',
      'Your password was changed successfully after initial setup.'
    );
  }

  /**
   * Admin resets password for any user
   */
  static async resetPasswordByAdmin(userId: string, adminId: string): Promise<void> {
    const admin = await UserRepository.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can reset passwords');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await BcryptUtil.hashPassword(tempPassword);

    // Update password
    await UserRepository.updatePassword(userId, hashedPassword);

    // Set flag to force password change on next login
    await UserRepository.update(userId, {
      mustChangePassword: true,
      passwordChangedAt: new Date(),
    });

    // Send password reset email
    await EmailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      tempPassword,
      user.role
    );

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'password.reset_by_admin',
        entity: 'User',
        entityId: userId,
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        type: 'PASSWORD_RESET_BY_ADMIN',
        description: `Password reset by administrator ${admin.email}`,
      },
    });
  }

  /**
   * Request password reset (forgot password)
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // In a real implementation, you'd store this in a separate PasswordReset table
        // For now, we'll use a mock implementation
      },
    });

    // Send password reset email
    await EmailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken
    );

    // Log the action
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET_REQUESTED',
        description: 'Password reset requested',
      },
    });
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: any): Promise<any> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Define allowed fields for update based on role
    const allowedFields: any = {
      [UserRole.ADMIN]: ['firstName', 'lastName', 'phone', 'department', 'jobTitle', 'avatar'],
      [UserRole.MANAGER]: ['firstName', 'lastName', 'phone', 'jobTitle', 'avatar'],
      [UserRole.EMPLOYEE]: ['firstName', 'lastName', 'phone', 'avatar'],
    };

    const roleAllowedFields = allowedFields[user.role as UserRole] || [];

    // Filter update data
    const filteredData = Object.keys(updateData)
      .filter(key => roleAllowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update for your role');
    }

    // Additional validations
    if (filteredData.phone) {
      // Validate phone format
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(filteredData.phone)) {
        throw new Error('Invalid phone number format');
      }
    }

    const updatedUser = await UserRepository.updateUser(userId, filteredData);

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'PROFILE_UPDATED',
        description: 'Profile updated successfully',
      },
    });

    // Send notification email
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'profile_updated',
      'Your profile information has been updated successfully.'
    );

    return updatedUser;
  }

  /**
   * Admin updates any user profile
   */
  static async updateUserProfileByAdmin(userId: string, updateData: any, adminId: string): Promise<any> {
    const admin = await UserRepository.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new Error('Only administrators can update user profiles');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Admin can update all fields except password
    const allowedFields = ['firstName', 'lastName', 'phone', 'department', 'jobTitle', 'avatar', 'role', 'status', 'managerId'];

    // Filter update data
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }

    // Special handling for role changes
    if (filteredData.role && filteredData.role !== user.role) {
      // If changing to manager, set status to VERIFICATION_PENDING
      if (filteredData.role === UserRole.MANAGER) {
        filteredData.status = UserStatus.VERIFICATION_PENDING;
        filteredData.emailVerified = false;
      }
      // If changing from manager, verify email automatically
      else if (user.role === UserRole.MANAGER) {
        filteredData.emailVerified = true;
      }
    }

    const updatedUser = await UserRepository.updateUser(userId, filteredData);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'user.updated_by_admin',
        entity: 'User',
        entityId: userId,
        oldValue: user,
        newValue: updatedUser,
      },
    });

    // Send notification to user
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'profile_updated',
      `Your account profile has been updated by administrator ${admin.email}`
    );

    return updatedUser;
  }

  // ==================== TOKEN MANAGEMENT ====================

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);
      const session = await prisma.session.findFirst({
        where: {
          userId: decoded.userId,
          token: refreshToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      const tokenPayload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        employeeId: decoded.employeeId,
      };

      const newAccessToken = JWTUtil.generateAccessToken(tokenPayload);
      const newRefreshToken = JWTUtil.generateRefreshToken(tokenPayload);

      // Update session with new refresh token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Delete specific session
      await prisma.session.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Delete all sessions for user
      await prisma.session.deleteMany({
        where: { userId },
      });
    }

    // Log the action
    await prisma.activity.create({
      data: {
        userId,
        type: 'USER_LOGOUT',
        description: 'User logged out',
      },
    });
  }

  private static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
        ipAddress: '127.0.0.1', // You should get this from request
        userAgent: 'Unknown', // You should get this from request
      },
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get user's subordinates (for managers and admins)
   */
  static async getSubordinates(managerId: string): Promise<any[]> {
    const manager = await UserRepository.findById(managerId);
    if (!manager) {
      throw new Error('User not found');
    }

    // Only managers and admins can view subordinates
    if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN) {
      throw new Error('Insufficient permissions');
    }

    const subordinates = await UserRepository.getSubordinates(managerId);
    return subordinates.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      employeeId: user.employeeId,
      phone: user.phone,
      department: user.department,
      jobTitle: user.jobTitle,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    }));
  }

  /**
   * Get all users with role-based filtering
   */
  static async getAllUsersWithPermissions(
    requesterId: string,
    filters: any = {}
  ): Promise<any> {
    const requester = await UserRepository.findById(requesterId);
    if (!requester) {
      throw new Error('Requester not found');
    }

    // Apply role-based filters
    switch (requester.role) {
      case UserRole.ADMIN:
        // Admin sees all users
        break;
      case UserRole.MANAGER:
        // Manager only sees users in their department
        filters.department = requester.department;
        // Manager cannot see other managers or admins
        filters.role = { notIn: [UserRole.MANAGER, UserRole.ADMIN] };
        break;
      case UserRole.EMPLOYEE:
        // Employee only sees themselves
        filters.id = requesterId;
        break;
    }

    return await UserRepository.getAllUsers(
      filters.page || 1,
      filters.limit || 10,
      filters
    );
  }

  /**
   * Get user statistics
   */
  static async getUserStats(requesterId: string): Promise<any> {
    const requester = await UserRepository.findById(requesterId);
    if (!requester) {
      throw new Error('User not found');
    }

    const stats = await UserRepository.getUserStats();

    // Filter based on role
    if (requester.role === UserRole.MANAGER) {
      // Manager only sees stats for their department
      stats.usersByDepartment = stats.usersByDepartment.filter(
        (dept: any) => dept.department === requester.department
      );
      stats.totalUsers = stats.usersByDepartment.reduce(
        (total: number, dept: any) => total + dept._count, 0
      );
      stats.activeUsers = Math.floor(stats.totalUsers * 0.8); // Example calculation
    } else if (requester.role === UserRole.EMPLOYEE) {
      // Employee sees limited stats
      return {
        totalUsers: 1,
        activeUsers: 1,
        userRole: requester.role,
      };
    }

    return stats;
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId: string, deactivatedById: string): Promise<void> {
    const deactivator = await UserRepository.findById(deactivatedById);
    if (!deactivator) {
      throw new Error('Deactivator not found');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check permissions
    if (deactivator.role === UserRole.MANAGER) {
      // Manager can only deactivate employees in their department
      if (user.role !== UserRole.EMPLOYEE || user.department !== deactivator.department) {
        throw new Error('You can only deactivate employees in your department');
      }
    } else if (deactivator.role !== UserRole.ADMIN) {
      throw new Error('Insufficient permissions');
    }

    // Prevent self-deactivation
    if (userId === deactivatedById) {
      throw new Error('Cannot deactivate your own account');
    }

    // Deactivate user
    await UserRepository.update(userId, {
      status: UserStatus.INACTIVE,
    });

    // Logout user
    await this.logout(userId);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: deactivatedById,
        action: 'user.deactivated',
        entity: 'User',
        entityId: userId,
        oldValue: { status: user.status },
        newValue: { status: UserStatus.INACTIVE },
      },
    });

    // Send notification to user
    await EmailService.sendAccountUpdateEmail(
      user.email,
      user.firstName,
      'status_changed',
      'Your account has been deactivated. Please contact administrator for more information.'
    );
  }
}

// Extend Error class to include additional data
export class AuthError extends Error {
  constructor(message: string, public readonly data?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

// Update the existing Error throwing to use AuthError
// Example: throw new AuthError('Message', { requiresPasswordChange: true });