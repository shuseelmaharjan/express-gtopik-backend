import express from 'express';
import { AuthController } from '../controller/AuthController';

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

export default router;
