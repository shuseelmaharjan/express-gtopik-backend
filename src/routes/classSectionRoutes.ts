import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import ClassSectionController from '../controller/ClassSectionController';

const router = express.Router();

/**
 * @route POST /api/v1/sections
 * @desc Create a new section
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/sections', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassSectionController.createSection);

/**
 * @route GET /api/v1/sections
 * @desc Get all active sections
 * @access Private
 */
router.get('/v1/sections', AuthMiddleware.authenticateToken, ClassSectionController.getAllActiveSections);

/**
 * @route GET /api/v1/sections/class/:class_id
 * @desc Get sections by class ID
 * @access Private
 */
router.get('/v1/sections/class/:class_id', AuthMiddleware.authenticateToken, ClassSectionController.getSectionsByClassId);

/**
 * @route GET /api/v1/sections/:id
 * @desc Get section by ID
 * @access Private
 */
router.get('/v1/sections/:id', AuthMiddleware.authenticateToken, ClassSectionController.getSectionById);

/**
 * @route PUT /api/v1/sections/:id/name
 * @desc Update section name
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/sections/:id/name', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassSectionController.updateSectionName);

/**
 * @route PUT /api/v1/sections/:id/status
 * @desc Update section status (activate/deactivate)
 * @access Private (Admin/SuperAdmin)
 */
router.put('/v1/sections/:id/status', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassSectionController.updateSectionStatus);

/**
 * @route DELETE /api/v1/sections/:id
 * @desc Delete/deactivate section
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/sections/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, ClassSectionController.deleteSection);

export default router;