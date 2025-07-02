import { Request, Response } from 'express';
import { AuthService } from '../service/AuthService';
import { DateTimeHelper } from '../utils/DateTimeHelper';

export class AuthController {
  /**
   * Login endpoint
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body) {
        console.log("Request body is missing or undefined");
        res.status(400).json({
          success: false,
          message:
            "Request body is required. Please send JSON data with Content-Type: application/json",
        });
        return;
      }

      if (typeof req.body !== "object") {
        console.log("Request body is not an object:", typeof req.body);
        res.status(400).json({
          success: false,
          message: "Invalid request data format. Expected JSON object",
        });
        return;
      }

      const { username, password } = req.body;
      console.log('Extracted fields - username:', username, 'password:', password ? '[PROVIDED]' : '[MISSING]');

      // Validate input - check for empty strings, null, undefined
      if (!username || !password || 
          typeof username !== 'string' || typeof password !== 'string' ||
          username.trim() === '' || password.trim() === '') {
        console.log('Validation failed - username or password invalid');
        res.status(400).json({
          success: false,
          message: 'Username and password are required and must be non-empty strings'
        });
        return;
      }

      console.log('Input validation passed, calling AuthService');

      // Call authentication service
      const result = await AuthService.login({ 
        username: username.trim(), 
        password: password.trim() 
      });

      // Set appropriate status code based on result
      const statusCode = result.success ? 200 : 401;
      
      res.status(statusCode).json(result);

    } catch (error) {
      console.error("Login controller error:", error);
      console.error("Error stack:", (error as Error).stack);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      console.log(`Token refresh attempt at ${DateTimeHelper.getDateTime()}`);
      
      // Check if request body exists
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Invalid request data. Refresh token is required'
        });
        return;
      }

      const { refreshToken } = req.body;

      // Validate input
      if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // Call authentication service
      const result = await AuthService.refreshAccessToken(refreshToken.trim());

      // Set appropriate status code based on result
      const statusCode = result.success ? 200 : 401;
      
      res.status(statusCode).json(result);

    } catch (error) {
      console.error("Token refresh controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log(`Logout attempt at ${DateTimeHelper.getDateTime()}`);
      
      // For now, just return success
      // In future, you can implement token blacklisting here
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error("Logout controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export default AuthController;