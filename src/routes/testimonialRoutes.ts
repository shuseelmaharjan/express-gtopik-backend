import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import TestimonialController from '../controller/TestimonialController';

const router = express.Router();

/**
 * @route POST /api/v1/testimonials
 * @desc Create a new testimonial
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/testimonials', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, TestimonialController.createTestimonial);

/**
 * @route GET /api/v1/testimonials/active
 * @desc Get all active testimonials
 * @access Public (with optional token refresh)
 */
router.get('/v1/testimonials/active', AuthMiddleware.authenticateToken(), TestimonialController.getAllActiveTestimonials);

/**
 * @route GET /api/v1/testimonials
 * @desc Get all testimonials (including inactive)
 * @access Private (Admin/SuperAdmin)
 */
router.get('/v1/testimonials', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, TestimonialController.getAllTestimonials);

/**
 * @route GET /api/v1/testimonials/:id
 * @desc Get testimonial by ID
 * @access Public
 */
router.get('/v1/testimonials/:id', TestimonialController.getTestimonialById);

/**
 * @route PUT /api/v1/testimonials/:id
 * @desc Update testimonial details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/testimonials/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, TestimonialController.updateTestimonial);

/**
 * @route DELETE /api/v1/testimonials/:id
 * @desc Deactivate/soft delete testimonial
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/testimonials/:id', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, TestimonialController.deactivateTestimonial);

/**
 * @route DELETE /api/v1/testimonials/:id/permanent
 * @desc Permanently delete testimonial
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/testimonials/:id/permanent', AuthMiddleware.authenticateToken(), AuthMiddleware.requireAdminstration, TestimonialController.deleteTestimonial);

export default router;
