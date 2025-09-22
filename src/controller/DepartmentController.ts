import { Request, Response } from 'express';
import DepartmentService from '../service/DepartmentService';
import UidHelper from '../utils/uidHelper';

class DepartmentController {
    // Get all departments
    async getAllDepartments(req: Request, res: Response): Promise<void> {
        try {
            const departments = await DepartmentService.getAllDepartments();
            
            res.status(200).json({
                success: true,
                message: 'Departments fetched successfully',
                data: departments
            });
        } catch (error) {
            console.error('Error fetching departments:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    // Get department by ID
    async getDepartmentById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const departmentId = parseInt(id);

            if (isNaN(departmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid department ID',
                    data: null
                });
                return;
            }

            const department = await DepartmentService.getDepartmentById(departmentId);
            
            res.status(200).json({
                success: true,
                message: 'Department fetched successfully',
                data: department
            });
        } catch (error) {
            console.error('Error fetching department:', error);
            const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    // Create new department
    async createDepartment(req: Request, res: Response): Promise<void> {
        try {
            const { facultyId, departmentName } = req.body;
            
            // Extract userId from Authorization header using uidHelper
            const getUserId = UidHelper.getUserId(req.headers);
            console.log("UserId, ", getUserId);
            const userId = getUserId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated or invalid token',
                    data: null
                });
                return;
            }

            if (!facultyId || !departmentName) {
                res.status(400).json({
                    success: false,
                    message: 'Faculty ID and department name are required',
                    data: null
                });
                return;
            }

            if (typeof departmentName !== 'string' || departmentName.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Department name must be a non-empty string',
                    data: null
                });
                return;
            }

            if (isNaN(parseInt(facultyId))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid faculty ID',
                    data: null
                });
                return;
            }

            const department = await DepartmentService.createDepartment(
                parseInt(facultyId),
                departmentName,
                userId
            );
            
            res.status(201).json({
                success: true,
                message: 'Department created successfully',
                data: department
            });
        } catch (error) {
            console.error('Error creating department:', error);
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    // Update department name
    async updateDepartmentName(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { departmentName } = req.body;
            
            const getUserId = UidHelper.getUserId(req.headers);
            console.log("UserId, ", getUserId);
            const userId = getUserId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated or invalid token',
                    data: null
                });
                return;
            }

            const departmentId = parseInt(id);
            if (isNaN(departmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid department ID',
                    data: null
                });
                return;
            }

            if (!departmentName || typeof departmentName !== 'string' || departmentName.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Department name must be a non-empty string',
                    data: null
                });
                return;
            }

            const department = await DepartmentService.updateDepartmentName(
                departmentId,
                departmentName,
                userId
            );
            
            res.status(200).json({
                success: true,
                message: 'Department name updated successfully',
                data: department
            });
        } catch (error) {
            console.error('Error updating department name:', error);
            const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    // Update department status
    async updateDepartmentStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            
            const getUserId = UidHelper.getUserId(req.headers);
            console.log("UserId, ", getUserId);
            const userId = getUserId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated or invalid token',
                    data: null
                });
                return;
            }

            const departmentId = parseInt(id);
            if (isNaN(departmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid department ID',
                    data: null
                });
                return;
            }

            if (typeof isActive !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'isActive must be a boolean value',
                    data: null
                });
                return;
            }

            const department = await DepartmentService.updateDepartmentStatus(
                departmentId,
                isActive,
                userId
            );
            
            res.status(200).json({
                success: true,
                message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: department
            });
        } catch (error) {
            console.error('Error updating department status:', error);
            const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }

    // Get departments by faculty ID
    async getDepartmentsByFacultyId(req: Request, res: Response): Promise<void> {
        try {
            const { facultyId } = req.params;
            const facultyIdNum = parseInt(facultyId);

            if (isNaN(facultyIdNum)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid faculty ID',
                    data: null
                });
                return;
            }

            const departments = await DepartmentService.getDepartmentsByFacultyId(facultyIdNum);
            
            res.status(200).json({
                success: true,
                message: 'Departments fetched successfully',
                data: departments
            });
        } catch (error) {
            console.error('Error fetching departments by faculty:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: null
            });
        }
    }
}

export default new DepartmentController();