import { Request, Response } from 'express';
import { AuthService } from '../service/AuthService';
import UidHelper from '../utils/uidHelper';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body) {
        console.log('Request body is missing or undefined');
        res.status(400).json({
          success: false,
          message: 'Request body is required. Please send JSON data with Content-Type: application/json'
        });
        return;
      }

      if (typeof req.body !== 'object') {
        console.log('Request body is not an object:', typeof req.body);
        res.status(400).json({
          success: false,
          message: 'Invalid request data format. Expected JSON object'
        });
        return;
      }

      const { identifier, password } = req.body;
      if (
        !identifier || !password ||
        typeof identifier !== "string" || typeof password !== "string" ||
        identifier.trim() === "" || password.trim() === ""
      ) {
        res.status(400).json({
          success: false,
          message: 'Username/email and password are required.'
        });
        return;
      }
      const result = await AuthService.login({
        identifier: identifier.trim(),
        password: password.trim()
      }, req);

      if (result.success && result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 24 * 60 * 60 * 1000,
          path: '/'
        });
        res.cookie("session", true,{
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 24 * 60 * 60 * 1000,
          path: '/'
        } )

        const { refreshToken, ...responseWithoutRefreshToken } = result;
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(responseWithoutRefreshToken);
      } else {
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      console.error('Login controller error:', error);
      console.error('Error stack:', (error as Error).stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    // console.log("Cookie received:", req.cookies);
    try {
      const refreshToken = req.cookies?.refreshToken;
      // console.log('Received refresh token:', refreshToken);

      if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Refresh token not found. Please login again.'
        });
        return;
      }

      const result = await AuthService.refreshAccessToken(refreshToken.trim());

      if (result.success && result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 24 * 60 * 60 * 1000,
          path: '/'
        });

        const { refreshToken: _, ...responseWithoutRefreshToken } = result;
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(responseWithoutRefreshToken);
      } else {
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(result);
      }

    } catch (error) {
      console.error('Token refresh controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log('Logout attempt received');

      const result = await AuthService.logout();

      if (result.success) {
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        });

        console.log('Refresh token cookie cleared');
      }
      const statusCode = result.success ? 200 : 500;
      res.status(statusCode).json(result);

    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Get access token from authorization header
      const accessToken = req.headers.authorization?.split(' ')[1];
      if (!accessToken) {
        res.status(401).json({
          success: false,
          message: 'No access token provided'
        });
        return;
      }

      // Extract user ID from token
      const userId = UidHelper.extractUserIdFromToken(accessToken);
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Invalid access token'
        });
        return;
      }

      // Validate request body
      if (!req.body) {
        res.status(400).json({
          success: false,
          message: 'Request body is required'
        });
        return;
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password, new password, and confirm password are required'
        });
        return;
      }

      // Validate data types
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
        res.status(400).json({
          success: false,
          message: 'All password fields must be strings'
        });
        return;
      }

      // Call service method
      const result = await AuthService.changePassword(parseInt(userId), {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      });

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);

    } catch (error) {
      console.error('Change password controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
