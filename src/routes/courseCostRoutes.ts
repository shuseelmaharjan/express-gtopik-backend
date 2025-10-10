import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import CourseCostController from '../controller/CourseCostController';

const router = express.Router();

/**
 * @route POST /api/v1/course-costs
 * @desc Create a new course cost
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/course-costs', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CourseCostController.createCourseCost);

/**
 * @route POST /api/v1/course-costs
 * @desc Update course cost (deactivate existing and create new)
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/update-course-costs', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CourseCostController.updateCourseCost);

export default router;