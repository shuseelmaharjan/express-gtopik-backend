import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import GalleryGroupController from '../controller/GalleryGroupController';

const router = express.Router();

/**
 * @route POST /api/v1/gallery-groups
 * @desc Create a new gallery group
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/gallery-groups', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryGroupController.createGalleryGroup);

/**
 * @route GET /api/v1/gallery-groups/active
 * @desc Get all active gallery groups
 * @access Public
 */
router.get('/v1/gallery-groups/active', GalleryGroupController.getAllActiveGalleryGroups);

/**
 * @route GET /api/v1/gallery-groups
 * @desc Get all gallery groups (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/gallery-groups', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryGroupController.getAllGalleryGroups);

/**
 * @route GET /api/v1/gallery-groups/:id
 * @desc Get gallery group by ID
 * @access Public
 */
router.get('/v1/gallery-groups/:id', GalleryGroupController.getGalleryGroupById);

/**
 * @route PUT /api/v1/gallery-groups/:id
 * @desc Update gallery group details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/gallery-groups/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryGroupController.updateGalleryGroup);

/**
 * @route DELETE /api/v1/gallery-groups/:id
 * @desc Deactivate/soft delete gallery group
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/gallery-groups/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryGroupController.deactivateGalleryGroup);

/**
 * @route DELETE /api/v1/gallery-groups/:id/permanent
 * @desc Permanently delete gallery group
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/gallery-groups/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryGroupController.deleteGalleryGroup);

export default router;
