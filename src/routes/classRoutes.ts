import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import ClassController from '../controller/ClassController';

const router = express.Router();

/**
 * @route POST /api/v1/classes
 * @desc Create a new class
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/classes', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassController.createClass);

/**
 * @route GET /api/v1/classes
 * @desc Get all active classes
 * @access Private
 */
router.get('/v1/classes', AuthMiddleware.authenticateToken, ClassController.getAllActiveClasses);

/**
 * @route GET /api/v1/classes/:id
 * @desc Get class by ID
 * @access Private
 */
router.get('/v1/classes/:id', AuthMiddleware.authenticateToken, ClassController.getClassById);

/**
 * @route PUT /api/v1/classes/:id
 * @desc Update class details
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/classes/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassController.updateClass);

/**
 * @route DELETE /api/v1/classes/:id
 * @desc Deactivate/soft delete class
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/classes/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassController.deactivateClass);

/**
 * @route GET /api/v1/classes/department/:departmentId
 * @desc Get classes by department ID
 * @access Private
 */
router.get('/v1/classes/department/:departmentId', AuthMiddleware.authenticateToken, ClassController.getClassesByDepartmentId);

export default router;