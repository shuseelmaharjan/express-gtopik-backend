"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DepartmentService_1 = __importDefault(require("../service/DepartmentService"));
const uidHelper_1 = __importDefault(require("../utils/uidHelper"));
class DepartmentController {
    // Get all departments
    getAllDepartments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const departments = yield DepartmentService_1.default.getAllDepartments();
                res.status(200).json({
                    success: true,
                    message: 'Departments fetched successfully',
                    data: departments
                });
            }
            catch (error) {
                console.error('Error fetching departments:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
    // Get department by ID
    getDepartmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const department = yield DepartmentService_1.default.getDepartmentById(departmentId);
                res.status(200).json({
                    success: true,
                    message: 'Department fetched successfully',
                    data: department
                });
            }
            catch (error) {
                console.error('Error fetching department:', error);
                const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
    // Create new department
    createDepartment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { facultyId, departmentName } = req.body;
                // Extract userId from Authorization header using uidHelper
                const getUserId = uidHelper_1.default.getUserId(req.headers);
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
                const department = yield DepartmentService_1.default.createDepartment(parseInt(facultyId), departmentName, userId);
                res.status(201).json({
                    success: true,
                    message: 'Department created successfully',
                    data: department
                });
            }
            catch (error) {
                console.error('Error creating department:', error);
                const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
    // Update department name
    updateDepartmentName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { departmentName } = req.body;
                const getUserId = uidHelper_1.default.getUserId(req.headers);
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
                const department = yield DepartmentService_1.default.updateDepartmentName(departmentId, departmentName, userId);
                res.status(200).json({
                    success: true,
                    message: 'Department name updated successfully',
                    data: department
                });
            }
            catch (error) {
                console.error('Error updating department name:', error);
                const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
    // Update department status
    updateDepartmentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { isActive } = req.body;
                const getUserId = uidHelper_1.default.getUserId(req.headers);
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
                const department = yield DepartmentService_1.default.updateDepartmentStatus(departmentId, isActive, userId);
                res.status(200).json({
                    success: true,
                    message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
                    data: department
                });
            }
            catch (error) {
                console.error('Error updating department status:', error);
                const statusCode = error instanceof Error && error.message === 'Department not found' ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
    // Get departments by faculty ID
    getDepartmentsByFacultyId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const departments = yield DepartmentService_1.default.getDepartmentsByFacultyId(facultyIdNum);
                res.status(200).json({
                    success: true,
                    message: 'Departments fetched successfully',
                    data: departments
                });
            }
            catch (error) {
                console.error('Error fetching departments by faculty:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Internal server error',
                    data: null
                });
            }
        });
    }
}
exports.default = new DepartmentController();
