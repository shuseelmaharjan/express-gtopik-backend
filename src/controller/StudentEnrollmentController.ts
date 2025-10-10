import { Request, Response } from 'express';
import StudentEnrollmentService from '../service/StudentEnrollmentService';
import UidHelper from '../utils/uidHelper';

class StudentEnrollmentController {
    // Create a new student enrollment
    static async createStudentEnrollment(req: Request, res: Response): Promise<void> {
        try {
            const {
                user_id,
                department_id,
                course_id,
                class_id,
                section_id,
                enrollmentDate,
                totalFees,
                discount,
                discountType,
                netFees,
                remarks
            } = req.body;
            
            const createdBy = UidHelper.getUserId(req.headers);
            
            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            const requiredFields = {
                user_id,
                department_id,
                course_id,
                class_id,
                section_id,
                enrollmentDate,
                totalFees,
                discount,
                netFees
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([key, value]) => value === undefined || value === null)
                .map(([key]) => key);

            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Required fields missing: ${missingFields.join(', ')}`
                });
                return;
            }

            // Validate field types and values
            if (isNaN(parseInt(user_id)) || parseInt(user_id) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "user_id must be a positive integer"
                });
                return;
            }

            if (isNaN(parseInt(department_id)) || parseInt(department_id) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "department_id must be a positive integer"
                });
                return;
            }

            if (isNaN(parseInt(course_id)) || parseInt(course_id) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "course_id must be a positive integer"
                });
                return;
            }

            if (isNaN(parseInt(class_id)) || parseInt(class_id) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "class_id must be a positive integer"
                });
                return;
            }

            if (isNaN(parseInt(section_id)) || parseInt(section_id) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "section_id must be a positive integer"
                });
                return;
            }

            // Validate enrollmentDate format
            const enrollmentDateObj = new Date(enrollmentDate);
            if (isNaN(enrollmentDateObj.getTime())) {
                res.status(400).json({
                    success: false,
                    message: "enrollmentDate must be a valid date (YYYY-MM-DD format)"
                });
                return;
            }

            // Validate totalFees
            if (isNaN(parseFloat(totalFees)) || parseFloat(totalFees) < 0) {
                res.status(400).json({
                    success: false,
                    message: "totalFees must be a non-negative number"
                });
                return;
            }

            // Validate discount
            if (isNaN(parseFloat(discount)) || parseFloat(discount) < 0) {
                res.status(400).json({
                    success: false,
                    message: "discount must be a non-negative number"
                });
                return;
            }

            // Validate netFees
            if (isNaN(parseFloat(netFees)) || parseFloat(netFees) < 0) {
                res.status(400).json({
                    success: false,
                    message: "netFees must be a non-negative number"
                });
                return;
            }

            // Validate discountType if provided
            if (discountType && !['scholarship', 'regular', 'other', 'none'].includes(discountType)) {
                res.status(400).json({
                    success: false,
                    message: "discountType must be 'scholarship', 'regular', 'other', or 'none'"
                });
                return;
            }

            const enrollmentData = {
                user_id: parseInt(user_id),
                department_id: parseInt(department_id),
                course_id: parseInt(course_id),
                class_id: parseInt(class_id),
                section_id: parseInt(section_id),
                enrollmentDate: enrollmentDate,
                totalFees: parseFloat(totalFees),
                discount: parseFloat(discount),
                discountType,
                netFees: parseFloat(netFees),
                remarks,
                createdBy
            };

            const newEnrollment = await StudentEnrollmentService.createStudentEnrollment(enrollmentData);
            
            res.status(201).json({
                success: true,
                message: "Student enrollment created successfully",
                data: newEnrollment
            });
        } catch (error: any) {
            console.error("Error in createStudentEnrollment controller:", error);
            
            if (error.message && error.message.startsWith('Error creating student enrollment:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error creating student enrollment: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default StudentEnrollmentController;