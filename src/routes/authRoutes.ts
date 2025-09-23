import express from 'express';
import { AuthController } from '../controller/AuthController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 * @body { username: string, password: string }
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 * @body { refreshToken: string }
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (token blacklisting)
 * @access Private
 * @body { }
 */
router.post('/logout', AuthController.logout);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private (requires valid access token)
 * @body { currentPassword: string, newPassword: string, confirmPassword: string }
 */
router.post('/change-password', AuthMiddleware.authenticateToken, AuthController.changePassword);

export default router;
