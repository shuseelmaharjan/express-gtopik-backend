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
   * Checks Bearer token first, then falls back to cookies with auto-refresh
   * @param optional - If true, allows request to continue even without valid token
   */
  static authenticateToken(optional: boolean = false) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Step 1: Check for Bearer token in Authorization header
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        

        // Step 2: If no Bearer token, check for accessToken in cookies
        if (!token) {
          token = req.cookies?.accessToken;
        }

        // Step 3: If accessToken exists, try to verify it
        if (token) {
          try {
            // Verify token using AuthService
            const decoded = AuthService.verifyAccessToken(token);
            
            // Validate session in database - Check if session is still active
            const session = await SessionService.getSessionByToken(token);
            
            if (!session || !session.isActive) {
              // Session revoked, try to refresh if refreshToken available
              throw new Error('Session revoked');
            }

            // Token is valid, add user info and session to request
            req.user = decoded;
            req.session = session;
            next();
            return;

          } catch (tokenError) {
            // AccessToken is invalid or expired, try to refresh
            console.log('AccessToken verification failed:', tokenError instanceof Error ? tokenError.message : 'Unknown error');
            console.log('Invalid token found, will attempt to refresh using refreshToken...');
            // Don't return here - continue to Step 4 to try refresh
          }
        }

        // Step 4: No valid accessToken found, try to refresh using refreshToken
        const refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
          if (optional) {
            // Optional auth: continue without authentication
            next();
            return;
          }
          res.status(401).json({
            success: false,
            message: 'Access token is required. Please login.'
          });
          return;
        }
        
        // Step 5: Attempt to refresh the access token
        try {
          const refreshResult = await AuthService.refreshAccessToken(refreshToken, req);
          
          if (!refreshResult.success || !refreshResult.data?.accessToken) {
            if (optional) {
              // Optional auth: continue without authentication
              next();
              return;
            }
            res.status(401).json({
              success: false,
              message: 'Invalid or expired refresh token. Please login again.'
            });
            return;
          }

          // Step 6: Verify the new accessToken first
          const decoded = AuthService.verifyAccessToken(refreshResult.data.accessToken);
          
          // Step 7: Set new accessToken in cookie
          res.cookie('accessToken', refreshResult.data.accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3 * 60 * 60 * 1000, // 3 hours
            path: '/'
          });

          // Step 8: Validate session
          const session = await SessionService.getSessionByToken(refreshResult.data.accessToken);

          if (!session || !session.isActive) {
            if (optional) {
              // Optional auth: continue without authentication
              next();
              return;
            }
            res.status(401).json({
              success: false,
              message: 'Session is no longer active. Please login again.'
            });
            return;
          }

          // Add user info, session, and new accessToken to request
          req.user = decoded;
          req.session = session;
          (req as any).newAccessToken = refreshResult.data.accessToken; // Optional: for response headers

          next();

        } catch (refreshError) {
          if (optional) {
            // Optional auth: continue without authentication
            next();
            return;
          }
          res.status(401).json({
            success: false,
            message: 'Failed to refresh token. Please login again.'
          });
        }

      } catch (error) {
        console.log('Authentication error:', error);
        if (optional) {
          // Optional auth: continue without authentication
          next();
          return;
        }
        res.status(403).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    };
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

  static requireAdminstration(req:Request, res:Response, next:NextFunction): void {
    AuthMiddleware.authorize(['superadmin', 'admin', 'staff'])(req, res, next);
  }
}
