import { Request, Response } from 'express';
import CoursesService from '../service/CoursesService';
import UidHelper from '../utils/uidHelper';

class CoursesController {
    // Create a new course
    static async createCourse(req: Request, res: Response): Promise<void> {
        try {
            const {
                title,
                description,
                duration,
                department_id
            } = req.body;
            
            const files = (req as any).files || {};
            const createdBy = UidHelper.getUserId(req.headers);
            
            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!title || !description || !duration || !department_id) {
                res.status(400).json({
                    success: false,
                    message: "title, description, duration, and department_id are required"
                });
                return;
            }

            // Validate required files
            if (!files.image || !files.coverImage) {
                res.status(400).json({
                    success: false,
                    message: "Both image and coverImage files are required"
                });
                return;
            }

            // Validate field types
            if (typeof title !== 'string' || title.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "title must be a non-empty string"
                });
                return;
            }

            if (typeof description !== 'string' || description.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "description must be a non-empty string"
                });
                return;
            }

            if (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
                res.status(400).json({
                    success: false,
                    message: "duration must be a positive number"
                });
                return;
            }

            if (isNaN(parseInt(department_id))) {
                res.status(400).json({
                    success: false,
                    message: "department_id must be a valid number"
                });
                return;
            }

            const courseData = {
                title,
                description,
                duration: parseFloat(duration),
                department_id: parseInt(department_id),
                createdBy
            };

            const newCourse = await CoursesService.createCourse(courseData, files);
            
            res.status(201).json({
                success: true,
                message: "Course created successfully",
                data: newCourse
            });
        } catch (error: any) {
            console.error("Error in createCourse controller:", error);
            
            if (error.message && error.message.startsWith('Error creating course:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error creating course: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all active courses
    static async getAllActiveCourses(req: Request, res: Response): Promise<void> {
        try {
            const courses = await CoursesService.getAllActiveCourses();
            
            res.status(200).json({
                success: true,
                message: "Active courses fetched successfully",
                data: courses
            });
        } catch (error: any) {
            console.error("Error in getAllActiveCourses controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching courses:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching courses: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get course by ID
    static async getCourseById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
                return;
            }

            const course = await CoursesService.getCourseById(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: "Course fetched successfully",
                data: course
            });
        } catch (error: any) {
            console.error("Error in getCourseById controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching course:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching course: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get course by slug
    static async getCourseBySlug(req: Request, res: Response): Promise<void> {
        try {
            const { slug } = req.params;
            
            if (!slug || typeof slug !== 'string') {
                res.status(400).json({
                    success: false,
                    message: "Valid slug is required"
                });
                return;
            }

            const course = await CoursesService.getCourseBySlug(slug);
            
            res.status(200).json({
                success: true,
                message: "Course fetched successfully",
                data: course
            });
        } catch (error: any) {
            console.error("Error in getCourseBySlug controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching course:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching course: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update course
    static async updateCourse(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                duration,
                popular,
                department_id
            } = req.body;
            
            const files = (req as any).files || {};
            const updatedBy = UidHelper.getUserId(req.headers);
            
            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
                return;
            }

            // Validate that at least one field is provided for update
            const hasUpdates = title !== undefined || description !== undefined || 
                              duration !== undefined || popular !== undefined || 
                              department_id !== undefined || files.image || files.coverImage;

            if (!hasUpdates) {
                res.status(400).json({
                    success: false,
                    message: "At least one field or file must be provided for update"
                });
                return;
            }

            // Validate field types if provided
            if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
                res.status(400).json({
                    success: false,
                    message: "title must be a non-empty string"
                });
                return;
            }

            if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
                res.status(400).json({
                    success: false,
                    message: "description must be a non-empty string"
                });
                return;
            }

            if (duration !== undefined && (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0)) {
                res.status(400).json({
                    success: false,
                    message: "duration must be a positive number"
                });
                return;
            }

            if (department_id !== undefined && isNaN(parseInt(department_id))) {
                res.status(400).json({
                    success: false,
                    message: "department_id must be a valid number"
                });
                return;
            }

            const updates: any = {};
            if (title !== undefined) updates.title = title;
            if (description !== undefined) updates.description = description;
            if (duration !== undefined) updates.duration = parseFloat(duration);
            if (popular !== undefined) updates.popular = popular === true || popular === 'true';
            if (department_id !== undefined) updates.department_id = parseInt(department_id);

            const updatedCourse = await CoursesService.updateCourse(parseInt(id), updatedBy, updates, files);
            
            res.status(200).json({
                success: true,
                message: "Course updated successfully",
                data: updatedCourse
            });
        } catch (error: any) {
            console.error("Error in updateCourse controller:", error);
            
            if (error.message && error.message.startsWith('Error updating course:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating course: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Delete course (soft delete)
    static async deleteCourse(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updatedBy = UidHelper.getUserId(req.headers);
            
            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
                return;
            }

            const result = await CoursesService.deleteCourse(parseInt(id), updatedBy);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: "Course deleted successfully"
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Failed to delete course"
                });
            }
        } catch (error: any) {
            console.error("Error in deleteCourse controller:", error);
            
            if (error.message && error.message.startsWith('Error deleting course:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error deleting course: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get courses by department
    static async getCoursesByDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { department_id } = req.params;
            
            if (isNaN(parseInt(department_id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }

            const courses = await CoursesService.getCoursesByDepartment(parseInt(department_id));
            
            res.status(200).json({
                success: true,
                message: "Courses fetched successfully",
                data: courses
            });
        } catch (error: any) {
            console.error("Error in getCoursesByDepartment controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching courses by department:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching courses by department: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get popular courses
    static async getPopularCourses(req: Request, res: Response): Promise<void> {
        try {
            const courses = await CoursesService.getPopularCourses();
            
            res.status(200).json({
                success: true,
                message: "Popular courses fetched successfully",
                data: courses
            });
        } catch (error: any) {
            console.error("Error in getPopularCourses controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching popular courses:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching popular courses: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get courses with cost information and filtering
    static async getCoursesWithCosts(req: Request, res: Response): Promise<void> {
        try {
            const { department_id, currency } = req.query;
            
            // Validate department_id if provided
            let departmentId: number | undefined = undefined;
            if (department_id) {
                if (isNaN(parseInt(department_id as string))) {
                    res.status(400).json({
                        success: false,
                        message: "department_id must be a valid number"
                    });
                    return;
                }
                departmentId = parseInt(department_id as string);
            }

            // Validate currency if provided
            let currencyFilter: string | undefined = undefined;
            if (currency) {
                if (typeof currency !== 'string' || currency.trim().length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "currency must be a non-empty string"
                    });
                    return;
                }
                currencyFilter = currency.trim();
            }

            const courses = await CoursesService.getCoursesWithCosts(departmentId, currencyFilter);
            
            res.status(200).json({
                success: true,
                message: "Courses with cost information fetched successfully",
                data: courses
            });
        } catch (error: any) {
            console.error("Error in getCoursesWithCosts controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching courses with costs:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching courses with costs: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Toggle popular status of a course
    static async toggleCoursePopular(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updatedBy = UidHelper.getUserId(req.headers);
            
            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
                return;
            }

            const result = await CoursesService.toggleCoursePopular(parseInt(id), updatedBy);
            
            res.status(200).json({
                success: true,
                message: `Course popular status toggled to ${result.popular ? 'popular' : 'not popular'}`,
                data: result
            });
        } catch (error: any) {
            console.error("Error in toggleCoursePopular controller:", error);
            
            if (error.message && error.message.startsWith('Error toggling course popular status:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error toggling course popular status: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get course info with active cost by department
    static async getCourseInfoWithCost(req: Request, res: Response): Promise<void> {
        try {
            const { departmentId } = req.params;
            
            if (isNaN(parseInt(departmentId))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }

            const courses = await CoursesService.getCourseInfoWithCost(parseInt(departmentId));
            
            res.status(200).json({
                success: true,
                message: "Courses info with cost fetched successfully",
                data: courses
            });
        } catch (error: any) {
            console.error("Error in getCourseInfoWithCost controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching course info with cost:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching course info with cost: ', '')
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

export default CoursesController;