import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import CareerController from '../controller/CareerController';

const router = express.Router();

/**
 * @route POST /api/v1/careers
 * @desc Create a new career
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/careers', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.createCareer);

/**
 * @route GET /api/v1/careers/active
 * @desc Get all active careers
 * @access Public
 */
router.get('/v1/careers/active', CareerController.getAllActiveCareers);

/**
 * @route GET /api/v1/careers/pending
 * @desc Get all pending careers
 * @access Public
 */
router.get('/v1/careers/pending', CareerController.getPendingCareers);

/**
 * @route GET /api/v1/careers
 * @desc Get all careers (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/careers', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.getAllCareers);

/**
 * @route GET /api/v1/careers/:id
 * @desc Get career by ID
 * @access Public
 */
router.get('/v1/careers/:id', CareerController.getCareerById);

/**
 * @route PUT /api/v1/careers/:id
 * @desc Update career details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/careers/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.updateCareer);

/**
 * @route DELETE /api/v1/careers/:id
 * @desc Deactivate/soft delete career
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/careers/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.deactivateCareer);

/**
 * @route DELETE /api/v1/careers/:id/permanent
 * @desc Permanently delete career
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/careers/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.deleteCareer);

/**
 * @route POST /api/v1/careers/update-statuses
 * @desc Manually trigger career status updates (admin endpoint)
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/careers/update-statuses', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, CareerController.updateCareerStatuses);

export default router;