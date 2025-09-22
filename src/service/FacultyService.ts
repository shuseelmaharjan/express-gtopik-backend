import Faculty from '../models/Faculty';
import { Op } from 'sequelize';

export class FacultyService {
    /**
     * Create a new faculty
     */
    static async createFaculty(facultyName: string, userId: string): Promise<Faculty> {
        try {
            const faculty = await Faculty.create({
                facultyName,
                createdBy: userId,
                updatedBy: userId,
                isActive: true
            });

            return faculty;
        } catch (error) {
            console.error('Error creating faculty:', error);
            throw new Error('Failed to create faculty');
        }
    }

    /**
     * Get all faculties
     */
    static async getAllFaculties(): Promise<Faculty[]> {
        try {
            const faculties = await Faculty.findAll({
                order: [['createdAt', 'DESC']]
            });

            return faculties;
        } catch (error) {
            console.error('Error fetching faculties:', error);
            throw new Error('Failed to fetch faculties');
        }
    }

    /**
     * Get faculty by ID
     */
    static async getFacultyById(id: number): Promise<Faculty | null> {
        try {
            const faculty = await Faculty.findByPk(id);
            return faculty;
        } catch (error) {
            console.error('Error fetching faculty by ID:', error);
            throw new Error('Failed to fetch faculty');
        }
    }

    /**
     * Update faculty name
     */
    static async updateFacultyName(id: number, facultyName: string, userId: string): Promise<Faculty | null> {
        try {
            const faculty = await Faculty.findByPk(id);
            
            if (!faculty) {
                return null;
            }

            faculty.facultyName = facultyName;
            faculty.updatedBy = userId;
            faculty.updatedAt = new Date();
            
            await faculty.save();
            return faculty;
        } catch (error) {
            console.error('Error updating faculty name:', error);
            throw new Error('Failed to update faculty name');
        }
    }

    /**
     * Update faculty status (isActive)
     */
    static async updateFacultyStatus(id: number, isActive: boolean, userId: string): Promise<Faculty | null> {
        try {
            const faculty = await Faculty.findByPk(id);
            
            if (!faculty) {
                return null;
            }

            faculty.isActive = isActive;
            faculty.updatedBy = userId;
            faculty.updatedAt = new Date();
            
            await faculty.save();
            return faculty;
        } catch (error) {
            console.error('Error updating faculty status:', error);
            throw new Error('Failed to update faculty status');
        }
    }

    /**
     * Check if faculty name already exists (for validation)
     */
    static async facultyNameExists(facultyName: string, excludeId?: number): Promise<boolean> {
        try {
            const whereCondition: any = { facultyName };
            
            if (excludeId) {
                whereCondition.id = { [Op.ne]: excludeId };
            }

            const faculty = await Faculty.findOne({
                where: whereCondition
            });

            return faculty !== null;
        } catch (error) {
            console.error('Error checking faculty name existence:', error);
            throw new Error('Failed to validate faculty name');
        }
    }
}