import { Request, Response } from 'express';
import ExtraFeesService from '../service/ExtraFeesService';
import UidHelper from '../utils/uidHelper';

class ExtraFeesController {
    /**
     * Create a new extra fee
     * POST /api/v1/extra-fees
     */
    static async createExtraFee(req: Request, res: Response): Promise<void> {
        try {
            const { student_id, fee_rule_id, amount, expiry_date, currency } = req.body;
            const created_by = UidHelper.getUserId(req.headers);

            if (!created_by) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required in headers'
                });
                return;
            }

            // Validate required fields
            if (!student_id || !fee_rule_id || !amount || !expiry_date) {
                res.status(400).json({
                    success: false,
                    message: 'student_id, fee_rule_id, amount, and expiry_date are required'
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

            // Parse expiry_date
            const parsedExpiryDate = new Date(expiry_date);
            if (isNaN(parsedExpiryDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid expiry date format'
                });
                return;
            }

            const result = await ExtraFeesService.createExtraFee(
                parseInt(student_id),
                parseInt(fee_rule_id),
                parseFloat(amount),
                parsedExpiryDate,
                parseInt(created_by),
                currency || 'NPR'
            );

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in createExtraFee controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all extra fees with optional filters
     * GET /api/v1/extra-fees
     */
    static async getAllExtraFees(req: Request, res: Response): Promise<void> {
        try {
            const student_id = req.query.student_id ? parseInt(req.query.student_id as string) : undefined;
            const isPaid = req.query.isPaid === 'true' ? true : req.query.isPaid === 'false' ? false : undefined;
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const result = await ExtraFeesService.getAllExtraFees(student_id, isPaid, page, limit);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in getAllExtraFees controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get extra fee by ID
     * GET /api/v1/extra-fees/:id
     */
    static async getExtraFeeById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid extra fee ID'
                });
                return;
            }

            const result = await ExtraFeesService.getExtraFeeById(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Error in getExtraFeeById controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update extra fee
     * PUT /api/v1/extra-fees/:id
     */
    static async updateExtraFee(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { amount, expiry_date, isPaid } = req.body;
            const updated_by = UidHelper.getUserId(req.headers);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid extra fee ID'
                });
                return;
            }

            if (!updated_by) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required in headers'
                });
                return;
            }

            // Validate amount if provided
            if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
                res.status(400).json({
                    success: false,
                    message: 'Amount must be a positive number'
                });
                return;
            }

            // Parse expiry_date if provided
            let parsedExpiryDate;
            if (expiry_date) {
                parsedExpiryDate = new Date(expiry_date);
                if (isNaN(parsedExpiryDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid expiry date format'
                    });
                    return;
                }
            }

            const result = await ExtraFeesService.updateExtraFee(
                id,
                amount ? parseFloat(amount) : undefined,
                parsedExpiryDate,
                isPaid,
                parseInt(updated_by)
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Error in updateExtraFee controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete extra fee
     * DELETE /api/v1/extra-fees/:id
     */
    static async deleteExtraFee(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid extra fee ID'
                });
                return;
            }

            const result = await ExtraFeesService.deleteExtraFee(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Error in deleteExtraFee controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get unpaid extra fees for a student
     * GET /api/v1/extra-fees/unpaid/:student_id
     */
    static async getUnpaidExtraFees(req: Request, res: Response): Promise<void> {
        try {
            const student_id = parseInt(req.params.student_id);

            if (isNaN(student_id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid student ID'
                });
                return;
            }

            const result = await ExtraFeesService.getUnpaidExtraFees(student_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in getUnpaidExtraFees controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Mark extra fee as paid
     * PATCH /api/v1/extra-fees/:id/mark-paid
     */
    static async markAsPaid(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const updated_by = UidHelper.getUserId(req.headers);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid extra fee ID'
                });
                return;
            }

            if (!updated_by) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required in headers'
                });
                return;
            }

            const result = await ExtraFeesService.markAsPaid(id, parseInt(updated_by));

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Error in markAsPaid controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default ExtraFeesController;
