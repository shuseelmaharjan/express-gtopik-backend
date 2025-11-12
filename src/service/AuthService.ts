import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import { DateTimeHelper } from '../utils/DateTimeHelper';
import { Op } from "sequelize";
import { SessionService } from './SessionService';
import UserSession from '../models/UserSession';

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      username: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      profilePicture?: string;
    };
    accessToken: string;
    refreshToken: string;
    sessionInfo?: {
      sessionId: string;
      deviceInfo: string;
      browserInfo: string;
    };
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
export class AuthService {
  static async login(credentials: LoginCredentials, request?: any, clientType: string = 'browser'): Promise<LoginResponse> {
    try {
      const { identifier, password } = credentials;

      // Try username first, then email
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username: identifier },
            { email: identifier }
          ]
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Create session record if request object is provided
      let sessionInfo;
      if (request) {
        try {
          const session = await SessionService.createSession(
            user.id,
            accessToken,
            request,
            refreshToken,
            clientType
          );
          sessionInfo = {
            sessionId: session.sessionId,
            deviceInfo: session.deviceInfo,
            browserInfo: session.browserInfo
          };
        } catch (sessionError) {
          console.error('Failed to create session:', sessionError);
          // Continue with login even if session creation fails
        }
      }

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
            role: user.role,
            isActive: user.isActive,
            profilePicture: user.profilePicture ? `${process.env.SERVER_URL}${user.profilePicture}` : undefined
          },
          accessToken,
          refreshToken,
          sessionInfo
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Internal server error. Please try again later.'
      };
    }
  }
  /**
   * Generate access token using JWT (3 hours expiry)
   */
  private static generateAccessToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      type: 'access'
    };

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, {
      expiresIn: '3h',
      issuer: 'golden-server',
      audience: 'golden-client'
    });
  }


  /**
   * Generate refresh token using JWT (15 days expiry)
   */
  private static generateRefreshToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      type: 'refresh'
    };

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, {
      expiresIn: '15d',
      issuer: 'golden-server',
      audience: 'golden-client'
    });
  }

  /**
   * Verify access token using JWT
   */
  static verifyAccessToken(token: string): any {
    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, secret, {
        issuer: 'golden-server',
        audience: 'golden-client'
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Access token verification failed');
      }
    }
  }

  /**
   * Verify refresh token using JWT
   */
  static verifyRefreshToken(token: string): any {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, secret, {
        issuer: 'golden-server',
        audience: 'golden-client'
      });

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Generate new access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string, request?: any): Promise<LoginResponse> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return { success: false, message: 'User not found or inactive' };
      }
      const newAccessToken = this.generateAccessToken(user);

      // Update existing session for this refresh token or create new one
      const existingSession = await UserSession.findOne({
        where: { userId: user.id, refreshToken, isActive: true }
      });
      if (existingSession) {
        await existingSession.update({ accessToken: newAccessToken, lastActivity: new Date() });
      } else if (request) {
        try {
          await SessionService.createSession(user.id, newAccessToken, request, refreshToken);
        } catch (sessionErr) {
          console.error('Failed to create session during refresh:', sessionErr);
        }
      }

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '),
            role: user.role,
            isActive: user.isActive,
            profilePicture: user.profilePicture ? `${process.env.SERVER_URL}${user.profilePicture}` : undefined
          },
          accessToken: newAccessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'Invalid or expired refresh token' };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: number, credentials: ChangePasswordCredentials): Promise<ChangePasswordResponse> {
    try {
      const { currentPassword, newPassword, confirmPassword } = credentials;

      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return {
          success: false,
          message: 'All password fields are required'
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'New password and confirm password do not match'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: 'New password must be at least 6 characters long'
        };
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          message: 'New password must be different from current password'
        };
      }

      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      await User.update(
        { password: hashedNewPassword },
        { where: { id: userId } }
      );

      console.log(`Password changed for user ID: ${userId} at ${DateTimeHelper.getDateTime()}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password. Please try again.'
      };
    }
  }

  /**
   * Logout user (invalidate tokens and blacklist refreshToken)
   */
  static async logout(refreshToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`User logout at ${DateTimeHelper.getDateTime()}`);

      // If refreshToken is provided, invalidate the session
      if (refreshToken) {
        try {
          // Find and deactivate the session associated with this refreshToken
          const session = await UserSession.findOne({
            where: {
              refreshToken,
              isActive: true
            }
          });

          if (session) {
            await session.update({
              isActive: false,
              logoutTime: new Date()
            });
            console.log(`Session ${session.sessionId} invalidated for user ${session.userId}`);
          } else {
            console.log('No active session found for the provided refresh token');
          }
        } catch (sessionError) {
          console.error('Error invalidating session:', sessionError);
          // Continue with logout even if session invalidation fails
        }
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      console.error('Logout service error:', error);
      return {
        success: false,
        message: 'Logout failed. Please try again.'
      };
    }
  }

  /**
   * Validate session using refresh token
   */
  static async validateSession(refreshToken: string): Promise<{
    isValid: boolean;
    user?: {
      id: number;
      username: string;
      email: string;
      name: string;
      role: string;
      profilePicture?: string;
      isActive: boolean;
    };
  }> {
    try {
      // Verify refresh token
      const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';
      const decoded = jwt.verify(refreshToken, secret) as { id: number; username: string };

      // Find active session with this refresh token
      const session = await UserSession.findOne({
        where: {
          refreshToken,
          isActive: true
        }
      });

      if (!session) {
        return { isValid: false };
      }

      // Get user details
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return { isValid: false };
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim(),
          role: user.role,
          isActive: user.isActive,
          profilePicture: user.profilePicture ? `${process.env.SERVER_URL}${user.profilePicture}` : undefined
        }
      };

    } catch (error) {
      console.error('Validate session error:', error);
      return { isValid: false };
    }
  }
}

