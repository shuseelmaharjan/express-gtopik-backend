import FeeRule from '../models/FeeCategory';

interface CreateFeeRuleData {
    name: string;
    category: string;
    defaultAmount: number;
    currency?: string;
    recurrenceType: 'ONCE' | 'RECURRING';
    intervalMonths?: number | null;
    section_id?: number | null;
    createdBy: number;
}

interface UpdateFeeRuleData {
    name?: string;
    category?: string;
    defaultAmount?: number;
    currency?: string;
    recurrenceType?: 'ONCE' | 'RECURRING';
    intervalMonths?: number | null;
    section_id?: number | null;
    isActive?: boolean;
    updatedBy: number;
}

class FeeRuleService {
    /**
     * Create a new fee rule
     */
    static async createFeeRule(data: CreateFeeRuleData) {
        try {
            // Validate recurrence logic
            if (data.recurrenceType === 'ONCE' && data.intervalMonths !== null && data.intervalMonths !== undefined) {
                return {
                    success: false,
                    message: 'intervalMonths must be null for ONCE recurrence type'
                };
            }

            if (data.recurrenceType === 'RECURRING' && (!data.intervalMonths || data.intervalMonths <= 0)) {
                return {
                    success: false,
                    message: 'intervalMonths must be a positive number for RECURRING recurrence type'
                };
            }

            const feeRule = await FeeRule.create({
                name: data.name,
                category: data.category as any,
                defaultAmount: data.defaultAmount,
                currency: data.currency || 'NPR',
                recurrenceType: data.recurrenceType,
                intervalMonths: data.intervalMonths || null,
                section_id: data.section_id || null,
                isActive: true
            });

            return {
                success: true,
                message: 'Fee rule created successfully',
                data: feeRule
            };
        } catch (error) {
            console.error('Error in createFeeRule:', error);
            return {
                success: false,
                message: 'Failed to create fee rule',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get all fee rules
     */
    static async getAllFeeRules() {
        try {
            const feeRules = await FeeRule.findAll({
                include: [{
                    association: 'section',
                    include: [{
                        association: 'class',
                        include: [{
                            association: 'department',
                            include: [{
                                association: 'faculty'
                            }]
                        }]
                    }]
                }],
                order: [['id', 'DESC']]
            });

            return {
                success: true,
                message: 'Fee rules retrieved successfully',
                data: feeRules
            };
        } catch (error) {
            console.error('Error in getAllFeeRules:', error);
            return {
                success: false,
                message: 'Failed to retrieve fee rules',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get fee rule by ID
     */
    static async getFeeRuleById(id: number) {
        try {
            const feeRule = await FeeRule.findByPk(id, {
                include: [{
                    association: 'section',
                    include: [{
                        association: 'class',
                        include: [{
                            association: 'department',
                            include: [{
                                association: 'faculty'
                            }]
                        }]
                    }]
                }]
            });

            if (!feeRule) {
                return {
                    success: false,
                    message: 'Fee rule not found'
                };
            }

            return {
                success: true,
                message: 'Fee rule retrieved successfully',
                data: feeRule
            };
        } catch (error) {
            console.error('Error in getFeeRuleById:', error);
            return {
                success: false,
                message: 'Failed to retrieve fee rule',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update fee rule
     */
    static async updateFeeRule(id: number, data: UpdateFeeRuleData) {
        try {
            const feeRule = await FeeRule.findByPk(id);

            if (!feeRule) {
                return {
                    success: false,
                    message: 'Fee rule not found'
                };
            }

            // Validate recurrence logic if being updated
            if (data.recurrenceType || data.intervalMonths !== undefined) {
                const newRecurrenceType = data.recurrenceType || feeRule.recurrenceType;
                const newIntervalMonths = data.intervalMonths !== undefined ? data.intervalMonths : feeRule.intervalMonths;

                if (newRecurrenceType === 'ONCE' && newIntervalMonths !== null) {
                    return {
                        success: false,
                        message: 'intervalMonths must be null for ONCE recurrence type'
                    };
                }

                if (newRecurrenceType === 'RECURRING' && (!newIntervalMonths || newIntervalMonths <= 0)) {
                    return {
                        success: false,
                        message: 'intervalMonths must be a positive number for RECURRING recurrence type'
                    };
                }
            }

            const updateData: any = {};

            if (data.name !== undefined) updateData.name = data.name;
            if (data.category !== undefined) updateData.category = data.category;
            if (data.defaultAmount !== undefined) updateData.defaultAmount = data.defaultAmount;
            if (data.currency !== undefined) updateData.currency = data.currency;
            if (data.recurrenceType !== undefined) updateData.recurrenceType = data.recurrenceType;
            if (data.intervalMonths !== undefined) updateData.intervalMonths = data.intervalMonths;
            if (data.section_id !== undefined) updateData.section_id = data.section_id;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            await feeRule.update(updateData);

            return {
                success: true,
                message: 'Fee rule updated successfully',
                data: feeRule
            };
        } catch (error) {
            console.error('Error in updateFeeRule:', error);
            return {
                success: false,
                message: 'Failed to update fee rule',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete fee rule
     */
    static async deleteFeeRule(id: number) {
        try {
            const feeRule = await FeeRule.findByPk(id);

            if (!feeRule) {
                return {
                    success: false,
                    message: 'Fee rule not found'
                };
            }

            await feeRule.destroy();

            return {
                success: true,
                message: 'Fee rule deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteFeeRule:', error);
            return {
                success: false,
                message: 'Failed to delete fee rule',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get fee rules by category
     */
    static async getFeeRulesByCategory(category: string) {
        try {
            const feeRules = await FeeRule.findAll({
                where: {
                    category: category,
                    isActive: true
                },
                order: [['name', 'ASC']]
            });

            return {
                success: true,
                message: 'Fee rules retrieved successfully',
                data: feeRules
            };
        } catch (error) {
            console.error('Error in getFeeRulesByCategory:', error);
            return {
                success: false,
                message: 'Failed to retrieve fee rules',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get fee rules by section (includes full hierarchy)
     */
    static async getFeeRulesBySection(section_id: number) {
        try {
            const feeRules = await FeeRule.findAll({
                where: {
                    section_id: section_id,
                    isActive: true
                },
                include: [{
                    association: 'section',
                    include: [{
                        association: 'class',
                        include: [{
                            association: 'department',
                            include: [{
                                association: 'faculty'
                            }]
                        }]
                    }]
                }],
                order: [['category', 'ASC'], ['name', 'ASC']]
            });

            return {
                success: true,
                message: 'Fee rules retrieved successfully',
                data: feeRules
            };
        } catch (error) {
            console.error('Error in getFeeRulesBySection:', error);
            return {
                success: false,
                message: 'Failed to retrieve fee rules',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get fee rules by currency
     */
    static async getFeeRulesByCurrency(currency: string) {
        try {
            const feeRules = await FeeRule.findAll({
                where: {
                    currency: currency,
                    isActive: true
                },
                include: [{
                    association: 'section',
                    include: [{
                        association: 'class',
                        include: [{
                            association: 'department',
                            include: [{
                                association: 'faculty'
                            }]
                        }]
                    }]
                }],
                order: [['category', 'ASC'], ['name', 'ASC']]
            });

            return {
                success: true,
                message: 'Fee rules retrieved successfully',
                data: feeRules
            };
        } catch (error) {
            console.error('Error in getFeeRulesByCurrency:', error);
            return {
                success: false,
                message: 'Failed to retrieve fee rules',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default FeeRuleService;