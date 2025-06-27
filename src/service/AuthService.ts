import bcrypt from 'bcrypt';
import User from '../models/User';
import { DateTimeHelper } from '../utils/DateTimeHelper';

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

export class AuthService {
  /**
   * Authenticate user and generate tokens
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { username, password } = credentials;

      // Find user by username
      const user = await User.findOne({
        where: { username: username }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate tokens (simplified for now)
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      console.log(`User login successful: ${user.username} at ${DateTimeHelper.getDateTime()}`);

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
   * Generate access token (simplified - replace with JWT later)
   */
  private static generateAccessToken(user: any): string {
    // For now, return a simple token. Replace with JWT later
    const tokenData = {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + (3 * 60 * 60 * 1000) // 3 hours
    };
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  /**
   * Generate refresh token (simplified - replace with JWT later)
   */
  private static generateRefreshToken(user: any): string {
    // For now, return a simple token. Replace with JWT later
    const tokenData = {
      id: user.id,
      username: user.username,
      exp: Date.now() + (15 * 24 * 60 * 60 * 1000) // 15 days
    };
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  /**
   * Verify access token (simplified version)
   */
  static verifyAccessToken(token: string): any {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired
      if (Date.now() > decoded.exp) {
        throw new Error('Token expired');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token (simplified version)
   */
  static verifyRefreshToken(token: string): any {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired
      if (Date.now() > decoded.exp) {
        throw new Error('Token expired');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
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
