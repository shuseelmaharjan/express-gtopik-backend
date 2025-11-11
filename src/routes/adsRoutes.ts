import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import AdsController from '../controller/AdsController';

const router = express.Router();

/**
 * @route POST /api/v1/ads
 * @desc Create a new ad
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/ads', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, AdsController.createAd);

/**
 * @route GET /api/v1/ads/active
 * @desc Get all active ads
 * @access Public (with token refresh)
 */
router.get('/v1/ads/active', AuthMiddleware.authenticateToken(true), AdsController.getAllActiveAds);

/**
 * @route GET /api/v1/ads
 * @desc Get all ads (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/ads', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, AdsController.getAllAds);

/**
 * @route GET /api/v1/ads/:id
 * @desc Get ad by ID
 * @access Public
 */
router.get('/v1/ads/:id', AdsController.getAdById);

/**
 * @route PUT /api/v1/ads/:id
 * @desc Update ad details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/ads/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, AdsController.updateAd);

/**
 * @route DELETE /api/v1/ads/:id
 * @desc Deactivate/soft delete ad
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/ads/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, AdsController.deactivateAd);

/**
 * @route DELETE /api/v1/ads/:id/permanent
 * @desc Permanently delete ad
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/ads/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, AdsController.deleteAd);

export default router;