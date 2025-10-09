import CourseCost from '../models/CourseCost';
import Course from '../models/Courses';

class CourseCostService {
    // Create a new course cost
    async createCourseCost(courseCostData: {
        currency: string;
        cost: number;
        course_id: number;
        createdBy: string;
    }) {
        try {
            // Validate that the course exists and is active
            const course = await Course.findOne({
                where: { id: courseCostData.course_id, isActive: true }
            });
            if (!course) {
                throw new Error('Course not found or inactive');
            }

            // Check if course cost already exists for this course and currency
            const existingCourseCost = await CourseCost.findOne({
                where: {
                    course_id: courseCostData.course_id,
                    currency: courseCostData.currency.trim().toUpperCase(),
                    isActive: true
                }
            });
            if (existingCourseCost) {
                throw new Error('Course cost already exists for this course and currency');
            }

            const newCourseCost = await CourseCost.create({
                currency: courseCostData.currency.trim().toUpperCase(),
                cost: courseCostData.cost,
                course_id: courseCostData.course_id,
                createdBy: courseCostData.createdBy,
                isActive: true
            });

            return newCourseCost;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating course cost: ${error.message}`);
            } else {
                throw new Error('Error creating course cost: Unknown error');
            }
        }
    }
}

export default new CourseCostService();