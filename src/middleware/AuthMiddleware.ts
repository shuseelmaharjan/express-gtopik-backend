import { Request, Response, NextFunction } from 'express';
import  {AuthService}  from '../service/AuthService';
import { SessionService } from '../service/SessionService';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export class AuthMiddleware {
  /**
   * Middleware to verify JWT token and authenticate user
   */
  static async authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get token from Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
        return;
      }

      // Verify token using AuthService
      const decoded = AuthService.verifyAccessToken(token);
      
      // Validate session in database - CRITICAL: Check if session is still active
      const session = await SessionService.getSessionByToken(token);
      
      if (!session || !session.isActive) {
        res.status(401).json({
          success: false,
          message: 'Session has been revoked or expired. Please login again.'
        });
        return;
      }

      // Add user info and session to request object
      req.user = decoded;
      req.session = session;
      next();

    } catch (error) {
      console.log('Token verification error:', error);
      res.status(403).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }
  }

  /**
   * Middleware to check if user has specific role
   */
  static authorize(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware to check if user is superadmin
   */
  static requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['superadmin'])(req, res, next);
  }

  /**
   * Middleware to check if user is admin or superadmin
   */
  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['superadmin', 'admin'])(req, res, next);
  }

  /**
   * Middleware to check if user is staff, admin or superadmin
   */
  static requireStaff(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['superadmin', 'admin', 'staff'])(req, res, next);
  }

  static requireStudent(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(['student'])(req, res, next);
  }
}
