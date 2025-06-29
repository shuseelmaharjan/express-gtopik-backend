import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import {DateTimeHelper} from '../utils/DateTimeHelper';

interface LoginCredentials {
  username: string;
  password: string;
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
    };
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;
      const user = await User.findOne({
        where: { username: username }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
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
          message: 'Invalid username or password'
        };
      }
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
          },
          accessToken,
          refreshToken
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
  static async refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive'
        };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      console.log(`Token refreshed for user: ${user.username} at ${DateTimeHelper.getDateTime()}`);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
          },
          accessToken: newAccessToken,
          refreshToken: refreshToken // Return the same refresh token
        }
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Invalid or expired refresh token'
      };
    }
  }
}

export default AuthService;