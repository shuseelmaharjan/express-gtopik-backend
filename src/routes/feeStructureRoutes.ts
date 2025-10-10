import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import FeeStructureController from '../controller/FeeStructureController';

const router = express.Router();

/**
 * @route POST /api/v1/fee-structures
 * @desc Create a new fee structure
 * @access Private (Admin/SuperAdmin)
 */
router.post('/v1/fee-structures', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, FeeStructureController.createFeeStructure);

/**
 * @route GET /api/v1/fee-structures
 * @desc Get all active fee structures
 * @access Private
 */
router.get('/v1/fee-structures', AuthMiddleware.authenticateToken, FeeStructureController.getAllFeeStructures);

/**
 * @route GET /api/v1/fee-structures/requirement/:requirement
 * @desc Get fee structures by requirement type (admission, upgrade, renewal)
 * @access Private
 */
router.get('/v1/fee-structures/requirement/:requirement', AuthMiddleware.authenticateToken, FeeStructureController.getFeeStructuresByRequirement);

/**
 * @route GET /api/v1/fee-structures/:id
 * @desc Get fee structure by ID
 * @access Private
 */
router.get('/v1/fee-structures/:id', AuthMiddleware.authenticateToken, FeeStructureController.getFeeStructureById);

/**
 * @route PATCH /api/v1/fee-structures/:id
 * @desc Update fee structure
 * @access Private (Admin/SuperAdmin)
 */
router.patch('/v1/fee-structures/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, FeeStructureController.updateFeeStructure);

/**
 * @route DELETE /api/v1/fee-structures/:id
 * @desc Delete fee structure (soft delete)
 * @access Private (Admin/SuperAdmin)
 */
router.delete('/v1/fee-structures/:id', AuthMiddleware.authenticateToken, AuthMiddleware.requireAdminstration, FeeStructureController.deleteFeeStructure);

export default router;