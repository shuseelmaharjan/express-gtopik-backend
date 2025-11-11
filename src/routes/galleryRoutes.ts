import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import GalleryController from '../controller/GalleryController';

const router = express.Router();

/**
 * @route POST /api/v1/gallery/upload
 * @desc Upload multiple gallery images
 * @access Private (Admin/SuperAdmin)
 * @body imageGroupId: number, images: File[]
 */
router.post('/v1/gallery/upload', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryController.uploadGalleryImages);

/**
 * @route GET /api/v1/gallery
 * @desc Get all gallery images (only from active groups)
 * @access Public
 */
router.get('/v1/gallery', GalleryController.getAllGalleryImages);

/**
 * @route GET /api/v1/gallery/group/:groupId
 * @desc Get gallery images by group ID (only if group is active)
 * @access Public
 */
router.get('/v1/gallery/group/:groupId', GalleryController.getGalleryImagesByGroup);

/**
 * @route GET /api/v1/gallery/:id
 * @desc Get gallery image by ID
 * @access Public
 */
router.get('/v1/gallery/:id', GalleryController.getGalleryImageById);

/**
 * @route DELETE /api/v1/gallery/:id
 * @desc Delete a single gallery image
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/gallery/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryController.deleteGalleryImage);

/**
 * @route DELETE /api/v1/gallery/bulk-delete
 * @desc Delete multiple gallery images
 * @access Private (Admin/SuperAdmin)
 * @body ids: number[]
 */
router.delete('/v1/gallery/bulk-delete', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, GalleryController.deleteMultipleGalleryImages);

export default router;
