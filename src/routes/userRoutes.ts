import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserController } from '../controller/UserController';

const router = express.Router();
/**
 * @route GET /api/V1/profile
 * @desc Get user's profile
 * @access Private
 * @header Authorization
 * @returns { username, email, role, profile }
 */
router.get('/v1/user-profile', AuthMiddleware.authenticateToken, UserController.getUserProfile);

/**
 * @route PUT /api/V1/deactivate-account
 * @desc Deactivate user account
 * @access Private
 */
router.put('/v1/deactivate-account', AuthMiddleware.authenticateToken, UserController.deactivateUserAccount);

export default router;