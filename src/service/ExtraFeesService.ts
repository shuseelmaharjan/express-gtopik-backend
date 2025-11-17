import ExtraFees from '../models/ExtraFees';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';
import { Op } from 'sequelize';

class ExtraFeesService {
    /**
     * Create a new extra fee record
     */
    static async createExtraFee(
        student_id: number,
        fee_rule_id: number,
        amount: number,
        expiry_date: Date,
        created_by: number,
        currency: string = 'NPR'
    ) {
        try {
            // Verify student exists
            const student = await User.findByPk(student_id);
            if (!student) {
                return {
                    success: false,
                    message: 'Student not found'
                };
            }

            // Create extra fee record
            const extraFee = await ExtraFees.create({
                student_id,
                fee_rule_id,
                amount,
                currency,
                expiry_date,
                isPaid: false,
                created_by,
                updated_by: created_by
            });

            // Get creator info
            const creatorInfo = await UserHelper.getUserFullNameById(created_by);

            return {
                success: true,
                message: 'Extra fee created successfully',
                data: {
                    id: extraFee.id,
                    student_id: extraFee.student_id,
                    fee_rule_id: extraFee.fee_rule_id,
                    amount: extraFee.amount,
                    currency: extraFee.currency,
                    expiry_date: extraFee.expiry_date,
                    isPaid: extraFee.isPaid,
                    created_by: creatorInfo,
                    createdAt: extraFee.createdAt
                }
            };

        } catch (error) {
            console.error('Error in createExtraFee:', error);
            return {
                success: false,
                message: 'Failed to create extra fee',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get all extra fees with optional filters
     */
    static async getAllExtraFees(
        student_id?: number,
        isPaid?: boolean,
        page: number = 1,
        limit: number = 10
    ) {
        try {
            const whereClause: any = {};

            if (student_id) {
                whereClause.student_id = student_id;
            }

            if (isPaid !== undefined) {
                whereClause.isPaid = isPaid;
            }

            const offset = (page - 1) * limit;

            const { count, rows: extraFees } = await ExtraFees.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            // Map extra fees with creator/updater names
            const extraFeesWithNames = await Promise.all(
                extraFees.map(async (fee) => {
                    const createdByInfo = await UserHelper.getUserFullNameById(fee.created_by);
                    const updatedByInfo = await UserHelper.getUserFullNameById(fee.updated_by);

                    // Get student info
                    const student = await User.findByPk(fee.student_id, {
                        attributes: ['firstName', 'middleName', 'lastName']
                    });

                    const studentName = student
                        ? [student.firstName, student.middleName, student.lastName]
                            .filter(Boolean)
                            .join(' ')
                        : 'Unknown';

                    return {
                        id: fee.id,
                        student_id: fee.student_id,
                        studentName,
                        fee_rule_id: fee.fee_rule_id,
                        amount: fee.amount,
                        currency: fee.currency,
                        expiry_date: fee.expiry_date,
                        isPaid: fee.isPaid,
                        created_by: createdByInfo,
                        updated_by: updatedByInfo,
                        createdAt: fee.createdAt,
                        updatedAt: fee.updatedAt
                    };
                })
            );

            return {
                success: true,
                message: 'Extra fees retrieved successfully',
                data: extraFeesWithNames,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };

        } catch (error) {
            console.error('Error in getAllExtraFees:', error);
            return {
                success: false,
                message: 'Failed to retrieve extra fees',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get extra fee by ID
     */
    static async getExtraFeeById(id: number) {
        try {
            const extraFee = await ExtraFees.findByPk(id);

            if (!extraFee) {
                return {
                    success: false,
                    message: 'Extra fee not found'
                };
            }

            const createdByInfo = await UserHelper.getUserFullNameById(extraFee.created_by);
            const updatedByInfo = await UserHelper.getUserFullNameById(extraFee.updated_by);

            // Get student info
            const student = await User.findByPk(extraFee.student_id, {
                attributes: ['firstName', 'middleName', 'lastName']
            });

            const studentName = student
                ? [student.firstName, student.middleName, student.lastName]
                    .filter(Boolean)
                    .join(' ')
                : 'Unknown';

            return {
                success: true,
                message: 'Extra fee retrieved successfully',
                data: {
                    id: extraFee.id,
                    student_id: extraFee.student_id,
                    studentName,
                    fee_rule_id: extraFee.fee_rule_id,
                    amount: extraFee.amount,
                    currency: extraFee.currency,
                    expiry_date: extraFee.expiry_date,
                    isPaid: extraFee.isPaid,
                    created_by: createdByInfo,
                    updated_by: updatedByInfo,
                    createdAt: extraFee.createdAt,
                    updatedAt: extraFee.updatedAt
                }
            };

        } catch (error) {
            console.error('Error in getExtraFeeById:', error);
            return {
                success: false,
                message: 'Failed to retrieve extra fee',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update extra fee
     */
    static async updateExtraFee(
        id: number,
        amount?: number,
        expiry_date?: Date,
        isPaid?: boolean,
        updated_by?: number
    ) {
        try {
            const extraFee = await ExtraFees.findByPk(id);

            if (!extraFee) {
                return {
                    success: false,
                    message: 'Extra fee not found'
                };
            }

            // Update fields if provided
            if (amount !== undefined) extraFee.amount = amount;
            if (expiry_date !== undefined) extraFee.expiry_date = expiry_date;
            if (isPaid !== undefined) extraFee.isPaid = isPaid;
            if (updated_by !== undefined) extraFee.updated_by = updated_by;

            await extraFee.save();

            const updatedByInfo = await UserHelper.getUserFullNameById(extraFee.updated_by);

            return {
                success: true,
                message: 'Extra fee updated successfully',
                data: {
                    id: extraFee.id,
                    student_id: extraFee.student_id,
                    fee_rule_id: extraFee.fee_rule_id,
                    amount: extraFee.amount,
                    currency: extraFee.currency,
                    expiry_date: extraFee.expiry_date,
                    isPaid: extraFee.isPaid,
                    updated_by: updatedByInfo,
                    updatedAt: extraFee.updatedAt
                }
            };

        } catch (error) {
            console.error('Error in updateExtraFee:', error);
            return {
                success: false,
                message: 'Failed to update extra fee',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete extra fee
     */
    static async deleteExtraFee(id: number) {
        try {
            const extraFee = await ExtraFees.findByPk(id);

            if (!extraFee) {
                return {
                    success: false,
                    message: 'Extra fee not found'
                };
            }

            await extraFee.destroy();

            return {
                success: true,
                message: 'Extra fee deleted successfully'
            };

        } catch (error) {
            console.error('Error in deleteExtraFee:', error);
            return {
                success: false,
                message: 'Failed to delete extra fee',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get unpaid extra fees for a student
     */
    static async getUnpaidExtraFees(student_id: number) {
        try {
            const unpaidFees = await ExtraFees.findAll({
                where: {
                    student_id,
                    isPaid: false
                },
                order: [['expiry_date', 'ASC']]
            });

            const feesWithDetails = await Promise.all(
                unpaidFees.map(async (fee) => {
                    const createdByInfo = await UserHelper.getUserFullNameById(fee.created_by);

                    return {
                        id: fee.id,
                        fee_rule_id: fee.fee_rule_id,
                        amount: fee.amount,
                        currency: fee.currency,
                        expiry_date: fee.expiry_date,
                        created_by: createdByInfo,
                        createdAt: fee.createdAt
                    };
                })
            );

            const totalUnpaid = unpaidFees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);

            return {
                success: true,
                message: 'Unpaid extra fees retrieved successfully',
                data: {
                    fees: feesWithDetails,
                    totalUnpaid,
                    count: unpaidFees.length
                }
            };

        } catch (error) {
            console.error('Error in getUnpaidExtraFees:', error);
            return {
                success: false,
                message: 'Failed to retrieve unpaid extra fees',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Mark extra fee as paid
     */
    static async markAsPaid(id: number, updated_by: number) {
        try {
            const extraFee = await ExtraFees.findByPk(id);

            if (!extraFee) {
                return {
                    success: false,
                    message: 'Extra fee not found'
                };
            }

            if (extraFee.isPaid) {
                return {
                    success: false,
                    message: 'Extra fee is already marked as paid'
                };
            }

            extraFee.isPaid = true;
            extraFee.updated_by = updated_by;
            await extraFee.save();

            const updatedByInfo = await UserHelper.getUserFullNameById(updated_by);

            return {
                success: true,
                message: 'Extra fee marked as paid successfully',
                data: {
                    id: extraFee.id,
                    isPaid: extraFee.isPaid,
                    updated_by: updatedByInfo,
                    updatedAt: extraFee.updatedAt
                }
            };

        } catch (error) {
            console.error('Error in markAsPaid:', error);
            return {
                success: false,
                message: 'Failed to mark extra fee as paid',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default ExtraFeesService;
