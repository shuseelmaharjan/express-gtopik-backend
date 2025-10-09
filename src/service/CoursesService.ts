import Course from '../models/Courses';
import Department from '../models/Department';
import User from '../models/User';
import CourseCost from '../models/CourseCost';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { generateUniqueFileName } from '../utils/fileNameHelper';

class CoursesService {
    // Helper function to generate slug from title
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
    }

    // Helper function to handle file upload
    private async handleFileUpload(file: any, fieldName: string): Promise<string> {
        try {
            // Validate file
            if (!file) {
                throw new Error(`${fieldName} file is required`);
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                throw new Error(`${fieldName} file exceeds 5MB limit`);
            }

            // Validate file type (images only)
            const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const fileExt = path.extname(file.name).toLowerCase();
            
            if (!allowedExts.includes(fileExt)) {
                throw new Error(`${fieldName} must be an image file (jpg, jpeg, png, gif, webp)`);
            }

            // Ensure upload directory exists
            const uploadDir = path.join(__dirname, '..', 'uploads', 'courses');
            fs.mkdirSync(uploadDir, { recursive: true });

            // Generate unique filename
            const uniqueFileName = generateUniqueFileName(file.name);
            const filePath = path.join(uploadDir, uniqueFileName);

            // Save file
            if (typeof file.mv === 'function') {
                await new Promise<void>((resolve, reject) => {
                    file.mv(filePath, (err: any) => err ? reject(err) : resolve());
                });
            } else if (file.data) {
                fs.writeFileSync(filePath, file.data);
            } else {
                throw new Error('Unsupported file upload method');
            }

            // Return the relative path for database storage
            return `/uploads/courses/${uniqueFileName}`;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(`Error uploading ${fieldName}: Unknown error`);
            }
        }
    }

    // Create a new course
    async createCourse(courseData: {
        title: string;
        description: string;
        duration: number;
        department_id: number;
        createdBy: string;
    }, files: any) {
        try {
            // Validate department exists and is active
            const department = await Department.findOne({
                where: { id: courseData.department_id, isActive: true }
            });
            if (!department) {
                throw new Error('Department not found or inactive');
            }

            // Generate unique slug
            const baseSlug = this.generateSlug(courseData.title);
            let slug = baseSlug;
            let counter = 1;
            
            // Check if slug exists and make it unique
            while (await Course.findOne({ where: { slug, isActive: true } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Check if course title already exists under this department
            const existingCourse = await Course.findOne({
                where: {
                    title: courseData.title.trim(),
                    department_id: courseData.department_id,
                    isActive: true
                }
            });
            if (existingCourse) {
                throw new Error('Course title already exists under this department');
            }

            // Handle file uploads
            const imagePath = await this.handleFileUpload(files.image, 'image');
            const coverImagePath = await this.handleFileUpload(files.coverImage, 'coverImage');

            const newCourse = await Course.create({
                title: courseData.title.trim(),
                description: courseData.description,
                duration: courseData.duration,
                image: imagePath,
                coverImage: coverImagePath,
                popular: false,
                department_id: courseData.department_id,
                createdBy: courseData.createdBy,
                slug: slug,
                isActive: true
            });

            return newCourse;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating course: ${error.message}`);
            } else {
                throw new Error('Error creating course: Unknown error');
            }
        }
    }

    // Get all active courses with department details
    async getAllActiveCourses() {
        try {
            const courses = await Course.findAll({
                where: { isActive: true },
                attributes: [
                    'id', 'title', 'description', 'duration', 'image', 'coverImage', 
                    'popular', 'slug', 'department_id', 'createdBy', 'createdAt', 
                    'updatedBy', 'updatedAt', 'isActive'
                ],
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName'],
                        where: { isActive: true },
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Enhance with user details
            const coursesWithUserDetails = await Promise.all(courses.map(async (course) => {
                const courseData = course.get({ plain: true }) as any;
                
                let createdByUser = null;
                let updatedByUser = null;
                
                try {
                    if (courseData.createdBy) {
                        createdByUser = await User.findByPk(courseData.createdBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                    
                    if (courseData.updatedBy) {
                        updatedByUser = await User.findByPk(courseData.updatedBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                } catch (userError) {
                    console.error('Error fetching user details:', userError);
                }
                
                return {
                    ...courseData,
                    createdByUser: createdByUser ? createdByUser.get({ plain: true }) : null,
                    updatedByUser: updatedByUser ? updatedByUser.get({ plain: true }) : null
                };
            }));

            return coursesWithUserDetails;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching courses: ${error.message}`);
            } else {
                throw new Error('Error fetching courses: Unknown error');
            }
        }
    }

    // Get course by ID
    async getCourseById(id: number) {
        try {
            const course = await Course.findByPk(id, {
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName']
                    }
                ]
            });

            if (!course) {
                throw new Error('Course not found');
            }

            const courseData = course.get({ plain: true }) as any;
            
            // Get user details
            let createdByUser = null;
            let updatedByUser = null;
            
            try {
                if (courseData.createdBy) {
                    createdByUser = await User.findByPk(courseData.createdBy, {
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    });
                }
                
                if (courseData.updatedBy) {
                    updatedByUser = await User.findByPk(courseData.updatedBy, {
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    });
                }
            } catch (userError) {
                console.error('Error fetching user details:', userError);
            }
            
            return {
                ...courseData,
                createdByUser: createdByUser ? createdByUser.get({ plain: true }) : null,
                updatedByUser: updatedByUser ? updatedByUser.get({ plain: true }) : null
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching course: ${error.message}`);
            } else {
                throw new Error('Error fetching course: Unknown error');
            }
        }
    }

    // Get course by slug
    async getCourseBySlug(slug: string) {
        try {
            const course = await Course.findOne({
                where: { slug, isActive: true },
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName']
                    }
                ]
            });

            if (!course) {
                throw new Error('Course not found');
            }

            return course;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching course: ${error.message}`);
            } else {
                throw new Error('Error fetching course: Unknown error');
            }
        }
    }

    // Update course
    async updateCourse(id: number, updatedBy: string, updates: {
        title?: string;
        description?: string;
        duration?: number;
        popular?: boolean;
        department_id?: number;
    }, files?: any) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw new Error('Course not found');
            }

            // If department is being updated, validate it
            if (updates.department_id !== undefined) {
                const department = await Department.findOne({
                    where: { id: updates.department_id, isActive: true }
                });
                if (!department) {
                    throw new Error('Department not found or inactive');
                }
            }

            // If title is being updated, check for uniqueness and regenerate slug
            if (updates.title !== undefined) {
                const targetDepartmentId = updates.department_id !== undefined ? updates.department_id : course.department_id;
                const existingCourse = await Course.findOne({
                    where: {
                        title: updates.title.trim(),
                        department_id: targetDepartmentId,
                        id: { [Op.ne]: id },
                        isActive: true
                    }
                });
                if (existingCourse) {
                    throw new Error('Course title already exists under this department');
                }

                // Generate new slug if title is updated
                const baseSlug = this.generateSlug(updates.title);
                let slug = baseSlug;
                let counter = 1;
                
                while (await Course.findOne({ 
                    where: { 
                        slug, 
                        id: { [Op.ne]: id },
                        isActive: true 
                    } 
                })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                
                course.slug = slug;
            }

            // Handle file uploads if provided
            if (files?.image) {
                const imagePath = await this.handleFileUpload(files.image, 'image');
                course.image = imagePath;
            }
            
            if (files?.coverImage) {
                const coverImagePath = await this.handleFileUpload(files.coverImage, 'coverImage');
                course.coverImage = coverImagePath;
            }

            // Update fields
            if (updates.title !== undefined) course.title = updates.title.trim();
            if (updates.description !== undefined) course.description = updates.description;
            if (updates.duration !== undefined) course.duration = updates.duration;
            if (updates.popular !== undefined) course.popular = updates.popular;
            if (updates.department_id !== undefined) course.department_id = updates.department_id;
            
            course.updatedBy = updatedBy;
            course.updatedAt = new Date();
            
            await course.save();
            return course;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating course: ${error.message}`);
            } else {
                throw new Error('Error updating course: Unknown error');
            }
        }
    }

    // Soft delete course (set isActive to false and clear slug)
    async deleteCourse(id: number, updatedBy: string) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw new Error('Course not found');
            }

            // Soft delete: set isActive to false and clear slug
            course.isActive = false;
            course.slug = null as any; // Clear slug to allow reuse
            course.updatedBy = updatedBy;
            course.updatedAt = new Date();
            
            await course.save();
            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting course: ${error.message}`);
            } else {
                throw new Error('Error deleting course: Unknown error');
            }
        }
    }

    // Get courses by department
    async getCoursesByDepartment(department_id: number) {
        try {
            const courses = await Course.findAll({
                where: { 
                    department_id: department_id,
                    isActive: true 
                },
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return courses;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching courses by department: ${error.message}`);
            } else {
                throw new Error('Error fetching courses by department: Unknown error');
            }
        }
    }

    // Get popular courses
    async getPopularCourses() {
        try {
            const courses = await Course.findAll({
                where: { 
                    popular: true,
                    isActive: true 
                },
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return courses;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching popular courses: ${error.message}`);
            } else {
                throw new Error('Error fetching popular courses: Unknown error');
            }
        }
    }

    // Get courses with cost information and filtering
    async getCoursesWithCosts(departmentId?: number, currency?: string) {
        try {
            // Build where clause for courses
            const whereClause: any = { isActive: true };
            if (departmentId) {
                whereClause.department_id = departmentId;
            }

            const courses = await Course.findAll({
                where: whereClause,
                attributes: [
                    'id', 'title', 'description', 'duration', 'image', 'coverImage', 
                    'popular', 'slug', 'department_id', 'createdBy', 'createdAt', 
                    'updatedBy', 'updatedAt', 'isActive'
                ],
                include: [
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName'],
                        where: { isActive: true },
                        required: false
                    },
                    {
                        model: CourseCost,
                        as: 'costs',
                        where: { 
                            isActive: true,
                            ...(currency ? { currency: currency.toUpperCase() } : {})
                        },
                        attributes: ['id', 'currency', 'cost'],
                        required: false,
                        limit: 1 // Get only the first active cost record
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Process courses to add user details and format cost information
            const coursesWithDetails = await Promise.all(courses.map(async (course) => {
                const courseData = course.get({ plain: true }) as any;
                
                // Get user details
                let createdByUser = null;
                let updatedByUser = null;
                
                try {
                    if (courseData.createdBy) {
                        createdByUser = await User.findByPk(courseData.createdBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                    
                    if (courseData.updatedBy) {
                        updatedByUser = await User.findByPk(courseData.updatedBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                } catch (userError) {
                    console.error('Error fetching user details:', userError);
                }

                // Extract cost information
                let cost = null;
                let costCurrency = null;
                
                if (courseData.costs && courseData.costs.length > 0) {
                    const courseCost = courseData.costs[0];
                    cost = parseFloat(courseCost.cost);
                    costCurrency = courseCost.currency.toLowerCase();
                }

                // Remove the costs array and add flattened cost and currency fields
                const { costs, ...courseWithoutCosts } = courseData;
                
                return {
                    ...courseWithoutCosts,
                    createdByUser: createdByUser ? createdByUser.get({ plain: true }) : null,
                    updatedByUser: updatedByUser ? updatedByUser.get({ plain: true }) : null,
                    cost: cost,
                    currency: costCurrency
                };
            }));

            return coursesWithDetails;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching courses with costs: ${error.message}`);
            } else {
                throw new Error('Error fetching courses with costs: Unknown error');
            }
        }
    }

    // Toggle popular status of a course
    async toggleCoursePopular(id: number, updatedBy: string) {
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                throw new Error('Course not found');
            }

            if (!course.isActive) {
                throw new Error('Cannot modify inactive course');
            }

            // Toggle the popular status
            course.popular = !course.popular;
            course.updatedBy = updatedBy;
            course.updatedAt = new Date();
            
            await course.save();
            
            return {
                id: course.id,
                title: course.title,
                popular: course.popular,
                updatedBy: course.updatedBy,
                updatedAt: course.updatedAt
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error toggling course popular status: ${error.message}`);
            } else {
                throw new Error('Error toggling course popular status: Unknown error');
            }
        }
    }
}

export default new CoursesService();