import express from 'express';
import DepartmentController from '../controller/DepartmentController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = express.Router();

// Get all departments - requires admin/superadmin role
router.get(
    '/v1/departments', 
    DepartmentController.getAllDepartments
);

// Get department by ID - requires admin/superadmin role
router.get(
    '/v1/departments/:id', 
    DepartmentController.getDepartmentById
);

// Create new department - requires admin/superadmin role
router.post(
    '/v1/departments', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin,  
    DepartmentController.createDepartment
);

// Update department name - requires admin/superadmin role
router.put(
    '/v1/department/:id/update',
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin, 
    DepartmentController.updateDepartmentName
);

// Update department status (activate/deactivate) - requires admin/superadmin role
router.put(
    '/v1/:id/status', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdmin, 
    DepartmentController.updateDepartmentStatus
);

// Get departments by faculty ID - requires admin/superadmin role
router.get(
    '/v1/departmentsfaculty/:facultyId', 
    AuthMiddleware.authenticateToken(), 
    AuthMiddleware.requireAdminstration, 
    DepartmentController.getDepartmentsByFacultyId
);

export default router;