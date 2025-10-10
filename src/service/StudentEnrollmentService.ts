import StudentEnrollment from '../models/StudentEnrollment';
import User from '../models/User';
import Department from '../models/Department';
import Course from '../models/Courses';
import Class from '../models/Class';
import ClassSection from '../models/ClassSection';

class StudentEnrollmentService {
    // Create a new student enrollment
    async createStudentEnrollment(enrollmentData: {
        user_id: number;
        department_id: number;
        course_id: number;
        class_id: number;
        section_id: number;
        enrollmentDate: string;
        totalFees: number;
        discount: number;
        discountType?: string;
        netFees: number;
        remarks?: string;
        createdBy: string;
    }) {
        try {
            // Validate that the user exists and is active
            const user = await User.findOne({
                where: { id: enrollmentData.user_id, isActive: true }
            });
            if (!user) {
                throw new Error('User not found or inactive');
            }

            // Validate that the department exists and is active
            const department = await Department.findOne({
                where: { id: enrollmentData.department_id, isActive: true }
            });
            if (!department) {
                throw new Error('Department not found or inactive');
            }

            // Validate that the course exists and is active
            const course = await Course.findOne({
                where: { id: enrollmentData.course_id, isActive: true }
            });
            if (!course) {
                throw new Error('Course not found or inactive');
            }

            // Validate that the class exists and is active
            const classEntity = await Class.findOne({
                where: { id: enrollmentData.class_id, isActive: true }
            });
            if (!classEntity) {
                throw new Error('Class not found or inactive');
            }

            // Validate that the section exists and is active
            const section = await ClassSection.findOne({
                where: { id: enrollmentData.section_id, isActive: true }
            });
            if (!section) {
                throw new Error('Section not found or inactive');
            }

            // Validate that the section belongs to the specified class
            if (section.class_id !== enrollmentData.class_id) {
                throw new Error('Section does not belong to the specified class');
            }

            // Validate that the course belongs to the specified department
            if (course.department_id !== enrollmentData.department_id) {
                throw new Error('Course does not belong to the specified department');
            }

            // Validate that the class belongs to the specified department
            if (classEntity.department_id !== enrollmentData.department_id) {
                throw new Error('Class does not belong to the specified department');
            }

            // Check if student is already enrolled in the same course
            const existingEnrollment = await StudentEnrollment.findOne({
                where: {
                    user_id: enrollmentData.user_id,
                    course_id: enrollmentData.course_id,
                    isActive: true
                }
            });
            if (existingEnrollment) {
                throw new Error('Student is already enrolled in this course');
            }

            // Validate discount type if provided
            if (enrollmentData.discountType && !['scholarship', 'regular', 'other', 'none'].includes(enrollmentData.discountType)) {
                throw new Error('Invalid discount type. Must be none, scholarship, regular, or other');
            }

            // Validate that netFees calculation is correct
            const calculatedNetFees = enrollmentData.totalFees - enrollmentData.discount;
            if (Math.abs(calculatedNetFees - enrollmentData.netFees) > 0.01) { // Allow for small rounding differences
                throw new Error('Net fees calculation is incorrect. It should be totalFees - discount');
            }

            // Validate that discount is not greater than total fees
            if (enrollmentData.discount > enrollmentData.totalFees) {
                throw new Error('Discount cannot be greater than total fees');
            }

            const newEnrollment = await StudentEnrollment.create({
                user_id: enrollmentData.user_id,
                department_id: enrollmentData.department_id,
                course_id: enrollmentData.course_id,
                class_id: enrollmentData.class_id,
                section_id: enrollmentData.section_id,
                enrollmentDate: new Date(enrollmentData.enrollmentDate),
                totalFees: enrollmentData.totalFees,
                discount: enrollmentData.discount,
                discountType: enrollmentData.discountType || undefined,
                netFees: enrollmentData.netFees,
                remarks: enrollmentData.remarks || undefined,
                createdBy: enrollmentData.createdBy,
                isActive: true
            });

            // Update user status to "Enrolled" after successful enrollment
            await User.update(
                { status: 'Enrolled' },
                { where: { id: enrollmentData.user_id } }
            );

            // Return enrollment with related data manually fetched
            const createdEnrollment = newEnrollment.get({ plain: true }) as any;
            
            // Manually fetch related entities to avoid association issues
            const userDetails = await User.findByPk(createdEnrollment.user_id, {
                attributes: ['id', 'firstName', 'lastName', 'email']
            });
            
            const departmentDetails = await Department.findByPk(createdEnrollment.department_id, {
                attributes: ['id', 'departmentName']
            });
            
            const courseDetails = await Course.findByPk(createdEnrollment.course_id, {
                attributes: ['id', 'title', 'duration']
            });
            
            const classDetails = await Class.findByPk(createdEnrollment.class_id, {
                attributes: ['id', 'className']
            });
            
            const sectionDetails = await ClassSection.findByPk(createdEnrollment.section_id, {
                attributes: ['id', 'sectionName']
            });

            return {
                ...createdEnrollment,
                user: userDetails ? userDetails.get({ plain: true }) : null,
                department: departmentDetails ? departmentDetails.get({ plain: true }) : null,
                course: courseDetails ? courseDetails.get({ plain: true }) : null,
                class: classDetails ? classDetails.get({ plain: true }) : null,
                section: sectionDetails ? sectionDetails.get({ plain: true }) : null
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating student enrollment: ${error.message}`);
            } else {
                throw new Error('Error creating student enrollment: Unknown error');
            }
        }
    }
}

export default new StudentEnrollmentService();