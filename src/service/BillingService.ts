import Billing from '../models/Billing';
import User from '../models/User';
import StudentEnrollment from '../models/StudentEnrollment';
import Department from '../models/Department';
import Courses from '../models/Courses';
import Class from '../models/Class';
import ClassSection from '../models/ClassSection';
import { UserHelper } from '../utils/userHelper';
import { Op } from 'sequelize';
import { toWords } from 'number-to-words';
import { adToBs } from "@sbmdkl/nepali-date-converter";

class BillingService {
    /**
     * Generate unique billId in format: BILL-YYYYMMDD-XXXXX
     */
    private static async generateUniqueBillId(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Get count of bills created today
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const todayCount = await Billing.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });
        
        const sequence = String(todayCount + 1).padStart(5, '0');
        return `${process.env.COMPANY_BILL_PREFIX}-${dateStr}-${sequence}`;
    }

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
                    'billId',
                    'amount',
                    'currency',
                    'paymentType',
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
                        billId: record.billId,
                        amount: record.amount,
                        currency: record.currency,
                        paymentType: record.paymentType,
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
        paymentType: 'cash_on_hand' | 'fonepay' | 'esewa' | 'khalti',
        billingType: 'advance' | 'partial',
        createdBy: number,
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

            // Generate unique billId
            const billId = await this.generateUniqueBillId();

            // Create billing record
            const billing = await Billing.create({
                billId: billId,
                userId: userId,
                amount: amount,
                currency: 'npr',
                paymentType: paymentType,
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
                    billId: billing.billId,
                    userId: billing.userId,
                    amount: billing.amount,
                    currency: billing.currency,
                    paymentType: billing.paymentType,
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

    /**
     * Get billing record by ID with amount in words and student information
     */
    static async getBillingById(billingId: number) {
    try {
        const billing = await Billing.findByPk(billingId);

        if (!billing) {
            return {
                success: false,
                message: 'Billing record not found'
            };
        }

        // Get creator info
        const createdByInfo = await UserHelper.getUserFullNameById(
            parseInt(billing.createdBy)
        );

        // Get updater info if exists
        let updatedByInfo = null;
        if (billing.updatedBy) {
            updatedByInfo = await UserHelper.getUserFullNameById(
                parseInt(billing.updatedBy)
            );
        }

        // Convert amount to words
        const amountNumber = parseFloat(billing.amount.toString());
        const amountInWords = toWords(amountNumber);
        const formattedAmountInWords =
            amountInWords.charAt(0).toUpperCase() +
            amountInWords.slice(1) +
            " Only.";

        let createdAtBs: string | null = null;
        try {
            // Ensure we have an ISO string: "YYYY-MM-DDTHH:mm:ss.sssZ"
            const createdAtIso =
                billing.createdAt instanceof Date
                    ? billing.createdAt.toISOString()
                    : String(billing.createdAt);

            const adDatePart = createdAtIso.split("T")[0]; // "2025-11-14"

            // adToBs expects an AD date string in YYYY-MM-DD
            const bsResult = adToBs(adDatePart);
            createdAtBs = typeof bsResult === 'string' ? bsResult : String(bsResult);
        } catch (e) {
            console.error("Failed to convert createdAt AD→BS:", e);
            createdAtBs = null; // fail gracefully
        }

        // Fetch user/student information
        const user = await User.findByPk(billing.userId, {
            attributes: [
                "id",
                "firstName",
                "middleName",
                "lastName",
                "username",
                "role",
                "guardianName",
                "guardianContact",
                "status"
            ]
        });

        let userInfo = null;
        let enrollmentsInfo: any[] = [];

        if (user) {
            // Construct full name
            const fullName = [user.firstName, user.middleName, user.lastName]
                .filter(Boolean)
                .join(" ");

            userInfo = {
                id: user.id,
                fullName,
                username: user.username,
                role: user.role,
                guardianName: user.guardianName,
                guardianContact: user.guardianContact,
                status: user.status
            };

            // Fetch active enrollments
            const enrollments = await StudentEnrollment.findAll({
                where: {
                    user_id: billing.userId,
                    isActive: true
                },
                attributes: [
                    "id",
                    "department_id",
                    "course_id",
                    "class_id",
                    "section_id",
                    "enrollmentDate",
                    "totalFees",
                    "discount",
                    "netFees",
                    "isActive"
                ]
            });

            // Fetch related data for enrollments
            enrollmentsInfo = await Promise.all(
                enrollments.map(async (enrollment) => {
                    const department = await Department.findByPk(
                        enrollment.department_id,
                        { attributes: ["id", "departmentName"] }
                    );
                    const course = await Courses.findByPk(enrollment.course_id, {
                        attributes: ["id", "title"]
                    });
                    const classData = await Class.findByPk(enrollment.class_id, {
                        attributes: ["id", "className"]
                    });
                    const section = await ClassSection.findByPk(
                        enrollment.section_id,
                        { attributes: ["id", "sectionName"] }
                    );

                    return {
                        id: enrollment.id,
                        department: department
                            ? { id: department.id, name: department.departmentName }
                            : null,
                        course: course
                            ? { id: course.id, name: course.title }
                            : null,
                        class: classData
                            ? { id: classData.id, name: classData.className }
                            : null,
                        section: section
                            ? { id: section.id, name: section.sectionName }
                            : null,
                        enrollmentDate: enrollment.enrollmentDate,
                        totalFees: enrollment.totalFees,
                        discount: enrollment.discount,
                        netFees: enrollment.netFees,
                        isActive: enrollment.isActive
                    };
                })
            );
        }

        return {
            success: true,
            message: "Billing record retrieved successfully",
            data: {
                id: billing.id,
                billId: billing.billId,
                amount: billing.amount,
                amountInWords: formattedAmountInWords,
                currency: billing.currency,
                paymentType: billing.paymentType,
                billingType: billing.billingType,
                remark: billing.remark,
                createdBy: createdByInfo,
                updatedBy: updatedByInfo,
                updatedRemark: billing.updatedRemark,

                createdAt: billing.createdAt,
                updatedAt: billing.updatedAt,

                createdAtBs, 

                user: userInfo,
                enrollments: enrollmentsInfo
            }
        };
    } catch (error) {
        console.error("Error in getBillingById:", error);
        return {
            success: false,
            message: "Failed to retrieve billing record",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

}

export default BillingService;
