import { Request, Response } from 'express';
import BillingService from '../service/BillingService';
import UidHelper from '../utils/uidHelper';

class BillingController {
    /**
     * Get user financial summary
     * GET /api/v1/billing/user-financial-summary/:userId
     */
    static async getUserFinancialSummary(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
                return;
            }

            const result = await BillingService.getUserFinancialSummary(userId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Error in getUserFinancialSummary controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Create a new billing record
     * POST /api/v1/billing
     */
    static async createBilling(req: Request, res: Response): Promise<void> {
        try {
            const { userId, amount, billingType, currency, remark } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required in headers'
                });
                return;
            }

            // Validate required fields
            if (!userId || !amount || !billingType) {
                res.status(400).json({
                    success: false,
                    message: 'userId, amount, and billingType are required'
                });
                return;
            }

            // Validate amount
            if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be a positive number'
                });
                return;
            }

            // Validate billingType
            if (!['advance', 'regular'].includes(billingType)) {
                res.status(400).json({
                    success: false,
                    message: 'Billing type must be either "advance" or "regular"'
                });
                return;
            }

            const result = await BillingService.createBilling(
                parseInt(userId),
                parseFloat(amount),
                billingType,
                parseInt(createdBy),
                currency || 'NPR',
                remark || null
            );

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in createBilling controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default BillingController;
