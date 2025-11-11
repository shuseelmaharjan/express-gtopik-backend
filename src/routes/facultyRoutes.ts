import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { FacultyController } from '../controller/FacultyController';

const router = express.Router();

/**
 * @route POST /api/v1/faculty
 * @desc Create a new faculty
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @body { facultyName: string }
 */
router.post('/v1/faculty', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin, 
    FacultyController.createFaculty
);

/**
 * @route GET /api/v1/faculty
 * @desc Get all faculties
 * @access Private (All authenticated users)
 * @header Authorization
 * @returns Array of faculties
 */
router.get('/v1/faculty', 
    FacultyController.getAllFaculties
);

/**
 * @route GET /api/v1/faculty/:id
 * @desc Get faculty by ID
 * @access Private (All authenticated users)
 * @header Authorization
 * @param id Faculty ID
 */
router.get('/v1/faculty/:id', 
    AuthMiddleware.authenticateToken(), 
    FacultyController.getFacultyById
);

/**
 * @route PUT /api/v1/faculty/:id/name
 * @desc Update faculty name
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @param id Faculty ID
 * @body { facultyName: string }
 */
router.put('/v1/faculty/:id/name', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin, 
    FacultyController.updateFacultyName
);

/**
 * @route PUT /api/v1/faculty/:id/status
 * @desc Update faculty status (activate/deactivate)
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @param id Faculty ID
 * @body { isActive: boolean }
 */
router.put('/v1/faculty/:id/status', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin, 
    FacultyController.updateFacultyStatus
);

export default router;