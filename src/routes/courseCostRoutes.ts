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

export default router;