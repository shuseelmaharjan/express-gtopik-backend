import { Request, Response } from 'express';
import BillingService from '../service/BillingService';
import PdfService from '../service/PdfService';
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
            const { userId, amount, paymentType, billingType, remark } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required in headers'
                });
                return;
            }

            // Validate required fields
            if (!userId || !amount || !paymentType || !billingType) {
                res.status(400).json({
                    success: false,
                    message: 'userId, amount, paymentType, and billingType are required'
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

            // Validate paymentType
            if (!['cash_on_hand', 'fonepay', 'esewa', 'khalti'].includes(paymentType)) {
                res.status(400).json({
                    success: false,
                    message: 'Payment type must be "cash_on_hand", "fonepay", "esewa", or "khalti"'
                });
                return;
            }

            // Validate billingType
            if (!['advance', 'partial'].includes(billingType)) {
                res.status(400).json({
                    success: false,
                    message: 'Billing type must be either "advance" or "partial"'
                });
                return;
            }

            const result = await BillingService.createBilling(
                parseInt(userId),
                parseFloat(amount),
                paymentType,
                billingType,
                parseInt(createdBy),
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

    /**
     * Get billing record by ID
     * GET /api/v1/billing/:id
     */
    static async getBillingById(req: Request, res: Response): Promise<void> {
        try {
            const billingId = parseInt(req.params.id);

            if (isNaN(billingId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid billing ID'
                });
                return;
            }

            const result = await BillingService.getBillingById(billingId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Error in getBillingById controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Generate and download PDF for billing record
     * GET /api/v1/billing/:id/pdf
     */
    static async downloadBillingPDF(req: Request, res: Response): Promise<void> {
        try {
            const billingId = parseInt(req.params.id);

            if (isNaN(billingId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid billing ID'
                });
                return;
            }

            // Fetch billing record
            const result = await BillingService.getBillingById(billingId);

            if (!result.success || !result.data) {
                res.status(404).json({
                    success: false,
                    message: result.message || 'Billing record not found'
                });
                return;
            }

            if (!result.data.createdBy) {
                res.status(400).json({
                    success: false,
                    message: 'Billing record has no creator information'
                });
                return;
            }

            // Generate PDF
            const pdfBuffer = await PdfService.generateBillingPDF(result.data as any);

            // Build filename using student full name
            const fullName = result.data.user?.fullName || `invoice-${billingId}`;
            const safeName = fullName.trim().replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
            const fileName = `${safeName}_invoice.pdf`;

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Length', pdfBuffer.length);

            // Send PDF buffer
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error in downloadBillingPDF controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default BillingController;
