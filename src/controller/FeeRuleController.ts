import { Request, Response } from 'express';
import FeeRuleService from '../service/FeeRuleService';
import UidHelper from '../utils/uidHelper';

class FeeRuleController {
    /**
     * Create a new fee rule
     * POST /api/v1/fee-rules
     */
    static async createFeeRule(req: Request, res: Response): Promise<void> {
        try {
            const {
                name,
                category,
                defaultAmount,
                currency,
                recurrenceType,
                intervalMonths,
                section_id
            } = req.body;

            // Validation
            if (!name || !category || !defaultAmount || !recurrenceType) {
                res.status(400).json({
                    success: false,
                    message: 'Name, category, defaultAmount, and recurrenceType are required'
                });
                return;
            }

            // Validate category
            const validCategories = ['tuition', 'lab', 'sports', 'exam', 'bus', 'eca', 'other'];
            if (!validCategories.includes(category)) {
                res.status(400).json({
                    success: false,
                    message: `Category must be one of: ${validCategories.join(', ')}`
                });
                return;
            }

            // Validate recurrenceType
            if (!['ONCE', 'RECURRING'].includes(recurrenceType)) {
                res.status(400).json({
                    success: false,
                    message: 'recurrenceType must be either ONCE or RECURRING'
                });
                return;
            }

            // Validate amount
            if (isNaN(parseFloat(defaultAmount)) || parseFloat(defaultAmount) <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'defaultAmount must be a positive number'
                });
                return;
            }

            const userId = UidHelper.getUserId(req.headers);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const result = await FeeRuleService.createFeeRule({
                name,
                category,
                defaultAmount: parseFloat(defaultAmount),
                currency,
                recurrenceType,
                intervalMonths: intervalMonths ? parseInt(intervalMonths) : null,
                section_id: section_id ? parseInt(section_id) : null,
                createdBy: parseInt(userId)
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in createFeeRule controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all fee rules
     * GET /api/v1/fee-rules
     */
    static async getAllFeeRules(req: Request, res: Response): Promise<void> {
        try {
            const result = await FeeRuleService.getAllFeeRules();

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in getAllFeeRules controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get fee rule by ID
     * GET /api/v1/fee-rules/:id
     */
    static async getFeeRuleById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid fee rule ID'
                });
                return;
            }

            const result = await FeeRuleService.getFeeRuleById(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in getFeeRuleById controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update fee rule
     * PUT /api/v1/fee-rules/:id
     */
    static async updateFeeRule(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid fee rule ID'
                });
                return;
            }

            const userId = UidHelper.getUserId(req.headers);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const {
                name,
                category,
                defaultAmount,
                currency,
                recurrenceType,
                intervalMonths,
                section_id,
                isActive
            } = req.body;

            // Validate category if provided
            if (category) {
                const validCategories = ['tuition', 'lab', 'sports', 'exam', 'bus', 'eca', 'other'];
                if (!validCategories.includes(category)) {
                    res.status(400).json({
                        success: false,
                        message: `Category must be one of: ${validCategories.join(', ')}`
                    });
                    return;
                }
            }

            // Validate recurrenceType if provided
            if (recurrenceType && !['ONCE', 'RECURRING'].includes(recurrenceType)) {
                res.status(400).json({
                    success: false,
                    message: 'recurrenceType must be either ONCE or RECURRING'
                });
                return;
            }

            // Validate amount if provided
            if (defaultAmount && (isNaN(parseFloat(defaultAmount)) || parseFloat(defaultAmount) <= 0)) {
                res.status(400).json({
                    success: false,
                    message: 'defaultAmount must be a positive number'
                });
                return;
            }

            const result = await FeeRuleService.updateFeeRule(id, {
                name,
                category,
                defaultAmount: defaultAmount ? parseFloat(defaultAmount) : undefined,
                currency,
                recurrenceType,
                intervalMonths: intervalMonths !== undefined ? (intervalMonths ? parseInt(intervalMonths) : null) : undefined,
                section_id: section_id !== undefined ? (section_id ? parseInt(section_id) : null) : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                updatedBy: parseInt(userId)
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in updateFeeRule controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete fee rule
     * DELETE /api/v1/fee-rules/:id
     */
    static async deleteFeeRule(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid fee rule ID'
                });
                return;
            }

            const result = await FeeRuleService.deleteFeeRule(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in deleteFeeRule controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get fee rules by category
     * GET /api/v1/fee-rules/category/:category
     */
    static async getFeeRulesByCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;

            const validCategories = ['tuition', 'lab', 'sports', 'exam', 'bus', 'eca', 'other'];
            if (!validCategories.includes(category)) {
                res.status(400).json({
                    success: false,
                    message: `Category must be one of: ${validCategories.join(', ')}`
                });
                return;
            }

            const result = await FeeRuleService.getFeeRulesByCategory(category);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in getFeeRulesByCategory controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get fee rules by section
     * GET /api/v1/fee-rules/section/:section_id
     */
    static async getFeeRulesBySection(req: Request, res: Response): Promise<void> {
        try {
            const section_id = parseInt(req.params.section_id);

            if (isNaN(section_id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid section ID'
                });
                return;
            }

            const result = await FeeRuleService.getFeeRulesBySection(section_id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in getFeeRulesBySection controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get fee rules by currency
     * GET /api/v1/fee-rules/currency/:currency
     */
    static async getFeeRulesByCurrency(req: Request, res: Response): Promise<void> {
        try {
            const { currency } = req.params;

            const validCurrencies = ['USD', 'NPR', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY'];
            if (!validCurrencies.includes(currency)) {
                res.status(400).json({
                    success: false,
                    message: `Currency must be one of: ${validCurrencies.join(', ')}`
                });
                return;
            }

            const result = await FeeRuleService.getFeeRulesByCurrency(currency);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in getFeeRulesByCurrency controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default FeeRuleController;