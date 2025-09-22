import Department from '../models/Department';
import Faculty from '../models/Faculty';

class DepartmentService {
    // Get all departments with faculty information
    async getAllDepartments() {
        try {
            const departments = await Department.findAll({
                include: [
                    {
                        model: Faculty,
                        as: 'faculty',
                        attributes: ['id', 'facultyName', 'isActive']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return departments;
        } catch (error) {
            throw new Error(`Error fetching departments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Get department by ID with faculty information
    async getDepartmentById(id: number) {
        try {
            const department = await Department.findByPk(id, {
                include: [
                    {
                        model: Faculty,
                        as: 'faculty',
                        attributes: ['id', 'facultyName', 'isActive']
                    }
                ]
            });
            
            if (!department) {
                throw new Error('Department not found');
            }
            
            return department;
        } catch (error) {
            throw new Error(`Error fetching department: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Create new department
    async createDepartment(facultyId: number, departmentName: string, userId: string) {
        try {
            // Validate faculty exists and is active
            const faculty = await Faculty.findByPk(facultyId);
            if (!faculty) {
                throw new Error('Faculty not found');
            }
            if (!faculty.isActive) {
                throw new Error('Cannot create department under inactive faculty');
            }

            // Check if department name already exists under this faculty
            const existingDepartment = await Department.findOne({
                where: {
                    facultyId,
                    departmentName: departmentName.trim()
                }
            });

            if (existingDepartment) {
                throw new Error('Department name already exists under this faculty');
            }

            const department = await Department.create({
                facultyId,
                departmentName: departmentName.trim(),
                createdBy: userId,
                updatedBy: userId,
                isActive: true
            });

            // Return department with faculty information
            return await this.getDepartmentById(department.id);
        } catch (error) {
            throw new Error(`Error creating department: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Update department name
    async updateDepartmentName(id: number, departmentName: string, userId: string) {
        try {
            const department = await Department.findByPk(id);
            if (!department) {
                throw new Error('Department not found');
            }

            // Check if new name already exists under the same faculty (excluding current department)
            const existingDepartment = await Department.findOne({
                where: {
                    facultyId: department.facultyId,
                    departmentName: departmentName.trim(),
                    id: { [require('sequelize').Op.ne]: id }
                }
            });

            if (existingDepartment) {
                throw new Error('Department name already exists under this faculty');
            }

            await department.update({
                departmentName: departmentName.trim(),
                updatedBy: userId,
                updatedAt: new Date()
            });

            // Return updated department with faculty information
            return await this.getDepartmentById(id);
        } catch (error) {
            throw new Error(`Error updating department name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Update department status (activate/deactivate)
    async updateDepartmentStatus(id: number, isActive: boolean, userId: string) {
        try {
            const department = await Department.findByPk(id);
            if (!department) {
                throw new Error('Department not found');
            }

            await department.update({
                isActive,
                updatedBy: userId,
                updatedAt: new Date()
            });

            // Return updated department with faculty information
            return await this.getDepartmentById(id);
        } catch (error) {
            throw new Error(`Error updating department status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Get departments by faculty ID
    async getDepartmentsByFacultyId(facultyId: number) {
        try {
            const departments = await Department.findAll({
                where: { facultyId },
                include: [
                    {
                        model: Faculty,
                        as: 'faculty',
                        attributes: ['id', 'facultyName', 'isActive']
                    }
                ],
                order: [['departmentName', 'ASC']]
            });
            return departments;
        } catch (error) {
            throw new Error(`Error fetching departments by faculty: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export default new DepartmentService();