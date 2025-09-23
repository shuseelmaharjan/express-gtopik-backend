"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const AuthService_1 = require("../service/AuthService");
const SessionService_1 = require("../service/SessionService");
class AuthMiddleware {
    /**
     * Middleware to verify JWT token and authenticate user
     */
    static authenticateToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const decoded = AuthService_1.AuthService.verifyAccessToken(token);
                // Validate session in database - CRITICAL: Check if session is still active
                const session = yield SessionService_1.SessionService.getSessionByToken(token);
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
            }
            catch (error) {
                console.log('Token verification error:', error);
                res.status(403).json({
                    success: false,
                    message: 'Invalid or expired access token'
                });
            }
        });
    }
    /**
     * Middleware to check if user has specific role
     */
    static authorize(allowedRoles) {
        return (req, res, next) => {
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
    static requireSuperAdmin(req, res, next) {
        AuthMiddleware.authorize(['superadmin'])(req, res, next);
    }
    /**
     * Middleware to check if user is admin or superadmin
     */
    static requireAdmin(req, res, next) {
        AuthMiddleware.authorize(['superadmin', 'admin'])(req, res, next);
    }
    /**
     * Middleware to check if user is staff, admin or superadmin
     */
    static requireStaff(req, res, next) {
        AuthMiddleware.authorize(['superadmin', 'admin', 'staff'])(req, res, next);
    }
    static requireStudent(req, res, next) {
        AuthMiddleware.authorize(['student'])(req, res, next);
    }
}
exports.AuthMiddleware = AuthMiddleware;
