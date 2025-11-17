import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import FeeRuleController from '../controller/FeeRuleController';

const router = express.Router();

/**
 * @route POST /api/v1/fee-rules
 * @desc Create a new fee rule
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.post(
    '/v1/fee-rules',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.createFeeRule
);

/**
 * @route GET /api/v1/fee-rules
 * @desc Get all fee rules
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/fee-rules',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.getAllFeeRules
);

/**
 * @route GET /api/v1/fee-rules/:id
 * @desc Get fee rule by ID
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/fee-rules/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.getFeeRuleById
);

/**
 * @route PUT /api/v1/fee-rules/:id
 * @desc Update fee rule
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.put(
    '/v1/fee-rules/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.updateFeeRule
);

/**
 * @route DELETE /api/v1/fee-rules/:id
 * @desc Delete fee rule
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.delete(
    '/v1/fee-rules/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.deleteFeeRule
);

/**
 * @route GET /api/v1/fee-rules/category/:category
 * @desc Get fee rules by category
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/fee-rules/category/:category',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.getFeeRulesByCategory
);

/**
 * @route GET /api/v1/fee-rules/section/:section_id
 * @desc Get fee rules by section (includes full hierarchy)
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/fee-rules/section/:section_id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.getFeeRulesBySection
);

/**
 * @route GET /api/v1/fee-rules/currency/:currency
 * @desc Get fee rules by currency
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/fee-rules/currency/:currency',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    FeeRuleController.getFeeRulesByCurrency
);

export default router;