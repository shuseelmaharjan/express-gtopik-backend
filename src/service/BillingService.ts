import Billing from '../models/Billing';
import User from '../models/User';
import StudentEnrollment from '../models/StudentEnrollment';
import Department from '../models/Department';
import Courses from '../models/Courses';
import Class from '../models/Class';
import ClassSection from '../models/ClassSection';
import { UserHelper } from '../utils/userHelper';
import { Op } from 'sequelize';

class BillingService {
    /**
     * Get user financial summary with enrollment and billing details
     */
    static async getUserFinancialSummary(userId: number) {
        try {
            // Fetch user basic info
            const user = await User.findByPk(userId, {
                attributes: [
                    'id',
                    'firstName',
                    'middleName',
                    'lastName',
                    'profilePicture',
                    'username',
                    'role',
                    'guardianName',
                    'guardianContact',
                    'remark',
                    'status'
                ]
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Construct full name
            const fullName = [user.firstName, user.middleName, user.lastName]
                .filter(Boolean)
                .join(' ');

            // Add SERVER_URL to profile picture
            const profilePicture = user.profilePicture
                ? `${process.env.SERVER_URL}${user.profilePicture}`
                : null;

            // Fetch all active student enrollments with related data
            const enrollments = await StudentEnrollment.findAll({
                where: {
                    user_id: userId,
                    isActive: true
                },
                attributes: [
                    'id',
                    'user_id',
                    'department_id',
                    'course_id',
                    'class_id',
                    'section_id',
                    'enrollmentDate',
                    'totalFees',
                    'discount',
                    'netFees',
                    'isActive'
                ]
            });

            // Fetch related department, course, class, section data manually
            const enrollmentsWithRelations = await Promise.all(
                enrollments.map(async (enrollment) => {
                    const department = await Department.findByPk(enrollment.department_id, {
                        attributes: ['id', 'departmentName']
                    });
                    const course = await Courses.findByPk(enrollment.course_id, {
                        attributes: ['id', 'title']
                    });
                    const classData = await Class.findByPk(enrollment.class_id, {
                        attributes: ['id', 'className']
                    });
                    const section = await ClassSection.findByPk(enrollment.section_id, {
                        attributes: ['id', 'sectionName']
                    });

                    return {
                        ...enrollment.toJSON(),
                        department: department ? { id: department.id, name: department.departmentName } : null,
                        course: course ? { id: course.id, name: course.title } : null,
                        class: classData ? { id: classData.id, name: classData.className } : null,
                        section: section ? { id: section.id, name: section.sectionName } : null
                    };
                })
            );

            // Calculate total net fees from all active enrollments
            const totalNetFees = enrollmentsWithRelations.reduce((sum, enrollment) => {
                return sum + parseFloat(enrollment.netFees.toString());
            }, 0);

            // Fetch all billing records for this user
            const allBillingRecords = await Billing.findAll({
                where: { userId: userId },
                attributes: ['amount']
            });

            // Calculate total paid amount
            const totalPaidAmount = allBillingRecords.reduce((sum, billing) => {
                return sum + parseFloat(billing.amount.toString());
            }, 0);

            // Calculate due amount
            const dueAmount = totalNetFees - totalPaidAmount;

            // Fetch last 10 billing records with creator/updater info
            const last10BillingRecords = await Billing.findAll({
                where: { userId: userId },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: [
                    'id',
                    'amount',
                    'currency',
                    'billingType',
                    'remark',
                    'createdBy',
                    'updatedBy',
                    'updatedRemark',
                    'createdAt',
                    'updatedAt'
                ]
            });

            // Process billing records to add creator/updater full names
            const billingRecordsWithNames = await Promise.all(
                last10BillingRecords.map(async (record) => {
                    const createdByInfo = await UserHelper.getUserFullNameById(
                        parseInt(record.createdBy)
                    );
                    
                    let updatedByInfo = null;
                    if (record.updatedBy) {
                        updatedByInfo = await UserHelper.getUserFullNameById(
                            parseInt(record.updatedBy)
                        );
                    }

                    return {
                        id: record.id,
                        amount: record.amount,
                        currency: record.currency,
                        billingType: record.billingType,
                        remark: record.remark,
                        createdBy: createdByInfo,
                        updatedBy: updatedByInfo,
                        updatedRemark: record.updatedRemark,
                        createdAt: record.createdAt,
                        updatedAt: record.updatedAt
                    };
                })
            );

            return {
                success: true,
                message: 'User financial summary retrieved successfully',
                data: {
                    user: {
                        id: user.id,
                        fullName: fullName,
                        profilePicture: profilePicture,
                        username: user.username,
                        role: user.role,
                        guardianName: user.guardianName,
                        guardianContact: user.guardianContact,
                        remark: user.remark,
                        status: user.status
                    },
                    enrollments: enrollmentsWithRelations.map(enrollment => ({
                        id: enrollment.id,
                        department: enrollment.department,
                        course: enrollment.course,
                        class: enrollment.class,
                        section: enrollment.section,
                        enrollmentDate: enrollment.enrollmentDate,
                        totalFees: enrollment.totalFees,
                        discount: enrollment.discount,
                        netFees: enrollment.netFees,
                        isActive: enrollment.isActive
                    })),
                    financialSummary: {
                        totalNetFees: totalNetFees.toFixed(2),
                        totalPaidAmount: totalPaidAmount.toFixed(2),
                        dueAmount: dueAmount.toFixed(2)
                    },
                    recentBillingHistory: billingRecordsWithNames
                }
            };

        } catch (error) {
            console.error('Error in getUserFinancialSummary:', error);
            return {
                success: false,
                message: 'Failed to retrieve user financial summary',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Create a new billing record
     */
    static async createBilling(
        userId: number,
        amount: number,
        billingType: 'advance' | 'regular',
        createdBy: number,
        currency: string = 'NPR',
        remark: string | null = null
    ) {
        try {
            // Verify user exists
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Create billing record
            const billing = await Billing.create({
                userId: userId,
                amount: amount,
                currency: currency,
                billingType: billingType,
                remark: remark,
                createdBy: createdBy.toString(),
                updatedBy: null,
                updatedRemark: null
            });

            // Get creator info
            const creatorInfo = await UserHelper.getUserFullNameById(createdBy);

            return {
                success: true,
                message: 'Billing record created successfully',
                data: {
                    id: billing.id,
                    userId: billing.userId,
                    amount: billing.amount,
                    currency: billing.currency,
                    billingType: billing.billingType,
                    remark: billing.remark,
                    createdBy: creatorInfo,
                    createdAt: billing.createdAt
                }
            };

        } catch (error) {
            console.error('Error in createBilling:', error);
            return {
                success: false,
                message: 'Failed to create billing record',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default BillingService;
