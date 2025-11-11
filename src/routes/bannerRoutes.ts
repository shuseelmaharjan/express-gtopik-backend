import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import BannerController from '../controller/BannerController';

const router = express.Router();

/**
 * @route POST /api/v1/banners
 * @desc Create a new banner
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/banners', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, BannerController.createBanner);

/**
 * @route GET /api/v1/banners/active
 * @desc Get all active banners
 * @access Public
 */
router.get('/v1/banners/active', BannerController.getAllActiveBanners);

/**
 * @route GET /api/v1/banners
 * @desc Get all banners (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/banners', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, BannerController.getAllBanners);

/**
 * @route GET /api/v1/banners/:id
 * @desc Get banner by ID
 * @access Public
 */
router.get('/v1/banners/:id', BannerController.getBannerById);

/**
 * @route PUT /api/v1/banners/:id
 * @desc Update banner details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/banners/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, BannerController.updateBanner);

/**
 * @route DELETE /api/v1/banners/:id
 * @desc Deactivate/soft delete banner
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/banners/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, BannerController.deactivateBanner);

/**
 * @route DELETE /api/v1/banners/:id/permanent
 * @desc Permanently delete banner
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/banners/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, BannerController.deleteBanner);

export default router;
