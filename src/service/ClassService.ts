import Class from '../models/Class';
import Faculty from '../models/Faculty';
import Department from '../models/Department';
import ClassSection from '../models/ClassSection';
import { Op } from 'sequelize';
import User from '../models/User';

class ClassService{
    // Create a new Classroom
    async createClass(className: string, faculty_id: number, department_id: number,  createdBy: string){
        try{
            // Validate faculty exists and is active
            const faculty = await Faculty.findByPk(faculty_id);
            if(!faculty){
                throw new Error('Faculty not found');
            }
            if(!faculty.isActive){
                throw new Error('Cannot create class under inactive faculty');
            }
            // Validate department exists and is active
            const department = await Department.findOne({ where: { id: department_id, facultyId: faculty_id, isActive: true } });
            if(!department){
                throw new Error('Department not found under the specified faculty');
            }
            if(!department.isActive){
                throw new Error('Cannot create class under inactive department');
            }

            // Check if class name already exists under this department
            const existingClass = await Class.findOne({
                where: {
                    className: className.trim(),
                    department_id: department_id,
                    isActive: true
                }
            });
            if(existingClass){
                throw new Error('Class name already exists under this department');
            }
            const newClass = await Class.create({
                className: className.trim(),
                faculty_id: faculty_id,
                department_id: department_id,
                createdBy: createdBy,
                isActive: true
            });

            // Create default section "Section A" for the new class
            try {
                await ClassSection.create({
                    class_id: newClass.id,
                    sectionName: 'Section A',
                    createdBy: createdBy,
                    isActive: true
                });
                console.log(`Default section "Section A" created for class: ${newClass.className}`);
            } catch (sectionError) {
                console.error('Error creating default section:', sectionError);
                // Note: We don't throw here to avoid rolling back class creation
                // The class is created successfully, section creation is a bonus feature
            }

            return newClass;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating class: ${error.message}`);
            } else {
                throw new Error('Error creating class: Unknown error');
            }
        }
    }

    // Get all active classes with faculty and department details
    async getAllActiveClasses(){
        try{
            const classes = await Class.findAll({
                where: { isActive: true },
                attributes: [
                    'id', 
                    'className', 
                    'faculty_id', 
                    'department_id', 
                    'createdBy', 
                    'createdAt', 
                    'updatedBy', 
                    'updatedAt', 
                    'isActive'
                ],
                include: [
                    {
                        model: Faculty,
                        as: 'faculty',
                        attributes: ['id', 'facultyName']
                    },
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'departmentName']
                    },
                    {
                        model: ClassSection,
                        as: 'sections',
                        attributes: ['id', 'sectionName', 'isActive'],
                        where: { isActive: true },
                        required: false // LEFT JOIN to include classes even without sections
                    }
                ]
            });

            // Transform the data to include section count and user details
            const classesWithEnhancedData = await Promise.all(classes.map(async (classItem) => {
                const classData = classItem.get({ plain: true }) as any;
                const sectionsCount = classData.sections ? classData.sections.length : 0;
                
                // Get user details for createdBy and updatedBy
                let createdByUser = null;
                let updatedByUser = null;
                
                try {
                    if (classData.createdBy) {
                        createdByUser = await User.findByPk(classData.createdBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                    
                    if (classData.updatedBy) {
                        updatedByUser = await User.findByPk(classData.updatedBy, {
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        });
                    }
                } catch (userError) {
                    console.error('Error fetching user details:', userError);
                }
                
                return {
                    ...classData,
                    sectionsCount: sectionsCount,
                    sections: classData.sections || [],
                    createdByUser: createdByUser ? createdByUser.get({ plain: true }) : null,
                    updatedByUser: updatedByUser ? updatedByUser.get({ plain: true }) : null
                };
            }));

            console.log("Fetched classes with sections and user details:", classesWithEnhancedData);
            return classesWithEnhancedData;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching classes: ${error.message}`);
            } else {
                throw new Error('Error fetching classes: Unknown error');
            }
        }
    }

    // Get specific class by ID with faculty and department details
    async getClassById(id: number){
        try{
            const classInstance = await Class.findByPk(id, {
                include: [
                    {
                        model: Faculty,
                        as: 'faculty',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Department,
                        as: 'department',
                        attributes: ['id', 'name']
                    }
                ]
            });
            if(!classInstance){
                throw new Error('Class not found');
            }
            return classInstance;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching class: ${error.message}`);
            } else {
                throw new Error('Error fetching class: Unknown error');
            }
        }
    }

    // Update class details by Id
    async updateClass(id: number, updatedBy: string, updates: { className?: string;}){
        try{
            const classInstance = await Class.findByPk(id);
            if(!classInstance){
                throw new Error('Class not found');
            }

            // If className is being updated, check for uniqueness under the department
            if(updates.className !== undefined){
                const targetDepartmentId = classInstance.department_id;
                const existingClass = await Class.findOne({
                    where: {
                        className: updates.className.trim(),
                        department_id: targetDepartmentId,
                        id: { [Op.ne]: id }, // Exclude current class
                        isActive: true
                    }
                });
                if(existingClass){
                    throw new Error('Class name already exists under this department');
                }
            }

            // Update fields
            if(updates.className !== undefined){
                classInstance.className = updates.className.trim();
            }
            
            classInstance.updatedBy = updatedBy;
            classInstance.updatedAt = new Date();
            
            await classInstance.save();
            return classInstance;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating class: ${error.message}`);
            } else {
                throw new Error('Error updating class: Unknown error');
            }
        }
    }

    // Soft delete class by Id
    async deleteClass(id: number, updatedBy: string){
        try{
            const classInstance = await Class.findByPk(id);
            if(!classInstance){
                throw new Error('Class not found');
            }
            classInstance.isActive = false;
            classInstance.updatedBy = updatedBy;
            classInstance.updatedAt = new Date();
            await classInstance.save();
            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting class: ${error.message}`);
            } else {
                throw new Error('Error deleting class: Unknown error');
            }
        }
    }
}
export default new ClassService();