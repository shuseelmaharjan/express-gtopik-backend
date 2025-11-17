import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import ExtraFeesController from '../controller/ExtraFeesController';

const router = express.Router();

/**
 * @route POST /api/v1/extra-fees
 * @desc Create a new extra fee
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.post(
    '/v1/extra-fees',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.createExtraFee
);

/**
 * @route GET /api/v1/extra-fees
 * @desc Get all extra fees with optional filters (student_id, isPaid, page, limit)
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/extra-fees',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.getAllExtraFees
);

/**
 * @route GET /api/v1/extra-fees/:id
 * @desc Get extra fee by ID
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/extra-fees/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.getExtraFeeById
);

/**
 * @route PUT /api/v1/extra-fees/:id
 * @desc Update extra fee
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.put(
    '/v1/extra-fees/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.updateExtraFee
);

/**
 * @route DELETE /api/v1/extra-fees/:id
 * @desc Delete extra fee
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.delete(
    '/v1/extra-fees/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.deleteExtraFee
);

/**
 * @route GET /api/v1/extra-fees/unpaid/:student_id
 * @desc Get unpaid extra fees for a student
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/extra-fees/unpaid/:student_id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.getUnpaidExtraFees
);

/**
 * @route PATCH /api/v1/extra-fees/:id/mark-paid
 * @desc Mark extra fee as paid
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.patch(
    '/v1/extra-fees/:id/mark-paid',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    ExtraFeesController.markAsPaid
);

export default router;
