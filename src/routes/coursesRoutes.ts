import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import CoursesController from '../controller/CoursesController';

const router = express.Router();

/**
 * @route POST /api/v1/courses
 * @desc Create a new course
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/courses', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CoursesController.createCourse);

/**
 * @route GET /api/v1/courses
 * @desc Get all active courses
 * @access Private
 */
router.get('/v1/courses', AuthMiddleware.authenticateToken, CoursesController.getAllActiveCourses);

/**
 * @route GET /api/v1/courses-with-costs
 * @desc Get courses with cost information and optional filtering
 * @query department_id (optional) - Filter by department ID
 * @query currency (optional) - Filter by currency
 * @access Private
 */
router.get('/v1/courses-with-costs', AuthMiddleware.authenticateToken, CoursesController.getCoursesWithCosts);

/**
 * @route GET /api/v1/courses/popular
 * @desc Get popular courses
 * @access Private
 */
router.get('/v1/courses/popular', AuthMiddleware.authenticateToken, CoursesController.getPopularCourses);

/**
 * @route GET /api/v1/courses/department/:department_id
 * @desc Get courses by department ID
 * @access Private
 */
router.get('/v1/courses/department/:department_id', AuthMiddleware.authenticateToken, CoursesController.getCoursesByDepartment);

/**
 * @route GET /api/v1/courses/slug/:slug
 * @desc Get course by slug
 * @access Private
 */
router.get('/v1/courses/slug/:slug', AuthMiddleware.authenticateToken, CoursesController.getCourseBySlug);

/**
 * @route PATCH /api/v1/courses/:id/toggle-popular
 * @desc Toggle popular status of a course
 * @access Private (Admin/SuperAdmin)
 */
router.patch('/v1/courses/:id/toggle-popular', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CoursesController.toggleCoursePopular);

/**
 * @route GET /api/v1/courses/:id
 * @desc Get course by ID
 * @access Private
 */
router.get('/v1/courses/:id', AuthMiddleware.authenticateToken, CoursesController.getCourseById);

/**
 * @route PUT /api/v1/courses/:id
 * @desc Update course details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/courses/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CoursesController.updateCourse);

/**
 * @route DELETE /api/v1/courses/:id
 * @desc Delete/deactivate course (soft delete)
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/courses/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, CoursesController.deleteCourse);

export default router;