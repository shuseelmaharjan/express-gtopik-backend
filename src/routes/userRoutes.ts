import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { UserController } from '../controller/UserController';
import { UploadController } from '../controller/UploadController';

const router = express.Router();
/**
 * @route GET /api/V1/profile
 * @desc Get user's profile
 * @access Private
 * @header Authorization
 * @returns { username, email, role, profile }
 */
router.get('/v1/user-profile', AuthMiddleware.authenticateToken, UserController.getUserProfile);

// Create user (admin or superadmin)
router.post('/v1/users', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdmin, UserController.createUser);

// Get full user by id
router.get('/v1/users/:id', AuthMiddleware.authenticateToken, UserController.getUserById);

// Update user (admin or superadmin)
router.put('/v1/users/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdmin, UserController.updateUser);

/**
 * @route PUT /api/V1/deactivate-account
 * @desc Deactivate user account
 * @access Private
 */
router.put('/v1/deactivate-account', AuthMiddleware.authenticateToken, UserController.deactivateUserAccount);

// Upload profile picture for the authenticated user (userId derived from access token)
router.post('/v1/users/upload-profile-picture', AuthMiddleware.authenticateToken, (req, res) => {
	UploadController.uploadProfile(req, res);
});

export default router;