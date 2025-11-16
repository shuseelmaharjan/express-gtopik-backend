import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import BillingController from '../controller/BillingController';

const router = express.Router();

/**
 * @route GET /api/v1/billing/user-financial-summary/:userId
 * @desc Get user financial summary with enrollment and billing details
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/billing/user-financial-summary/:userId',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    BillingController.getUserFinancialSummary
);

/**
 * @route POST /api/v1/billing
 * @desc Create a new billing record
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.post(
    '/v1/billing',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    BillingController.createBilling
);

/**
 * @route GET /api/v1/billing/:id
 * @desc Get billing record by ID with amount in words
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/billing/:id',
    AuthMiddleware.authenticateToken(),
    AuthMiddleware.requireAdminstration,
    BillingController.getBillingById
);

/**
 * @route GET /api/v1/billing/:id/pdf
 * @desc Download billing invoice as PDF
 * @access Private (Admin/SuperAdmin/Staff)
 */
router.get(
    '/v1/billing/:id/pdf',
    BillingController.downloadBillingPDF
);

export default router;
