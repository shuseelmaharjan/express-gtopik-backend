import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import StudentEnrollmentController from '../controller/StudentEnrollmentController';

const router = express.Router();

/**
 * @route POST /api/v1/student-enrollments
 * @desc Create a new student enrollment
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/student-enrollments', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, StudentEnrollmentController.createStudentEnrollment);

export default router;