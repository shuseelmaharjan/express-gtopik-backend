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
const Department_1 = __importDefault(require("../models/Department"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
class DepartmentService {
    // Get all departments with faculty information
    getAllDepartments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const departments = yield Department_1.default.findAll({
                    include: [
                        {
                            model: Faculty_1.default,
                            as: 'faculty',
                            attributes: ['id', 'facultyName', 'isActive']
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });
                return departments;
            }
            catch (error) {
                throw new Error(`Error fetching departments: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Get department by ID with faculty information
    getDepartmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield Department_1.default.findByPk(id, {
                    include: [
                        {
                            model: Faculty_1.default,
                            as: 'faculty',
                            attributes: ['id', 'facultyName', 'isActive']
                        }
                    ]
                });
                if (!department) {
                    throw new Error('Department not found');
                }
                return department;
            }
            catch (error) {
                throw new Error(`Error fetching department: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Create new department
    createDepartment(facultyId, departmentName, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate faculty exists and is active
                const faculty = yield Faculty_1.default.findByPk(facultyId);
                if (!faculty) {
                    throw new Error('Faculty not found');
                }
                if (!faculty.isActive) {
                    throw new Error('Cannot create department under inactive faculty');
                }
                // Check if department name already exists under this faculty
                const existingDepartment = yield Department_1.default.findOne({
                    where: {
                        facultyId,
                        departmentName: departmentName.trim()
                    }
                });
                if (existingDepartment) {
                    throw new Error('Department name already exists under this faculty');
                }
                const department = yield Department_1.default.create({
                    facultyId,
                    departmentName: departmentName.trim(),
                    createdBy: userId,
                    updatedBy: userId,
                    isActive: true
                });
                // Return department with faculty information
                return yield this.getDepartmentById(department.id);
            }
            catch (error) {
                throw new Error(`Error creating department: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Update department name
    updateDepartmentName(id, departmentName, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield Department_1.default.findByPk(id);
                if (!department) {
                    throw new Error('Department not found');
                }
                // Check if new name already exists under the same faculty (excluding current department)
                const existingDepartment = yield Department_1.default.findOne({
                    where: {
                        facultyId: department.facultyId,
                        departmentName: departmentName.trim(),
                        id: { [require('sequelize').Op.ne]: id }
                    }
                });
                if (existingDepartment) {
                    throw new Error('Department name already exists under this faculty');
                }
                yield department.update({
                    departmentName: departmentName.trim(),
                    updatedBy: userId,
                    updatedAt: new Date()
                });
                // Return updated department with faculty information
                return yield this.getDepartmentById(id);
            }
            catch (error) {
                throw new Error(`Error updating department name: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Update department status (activate/deactivate)
    updateDepartmentStatus(id, isActive, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const department = yield Department_1.default.findByPk(id);
                if (!department) {
                    throw new Error('Department not found');
                }
                yield department.update({
                    isActive,
                    updatedBy: userId,
                    updatedAt: new Date()
                });
                // Return updated department with faculty information
                return yield this.getDepartmentById(id);
            }
            catch (error) {
                throw new Error(`Error updating department status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // Get departments by faculty ID
    getDepartmentsByFacultyId(facultyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const departments = yield Department_1.default.findAll({
                    where: { facultyId },
                    include: [
                        {
                            model: Faculty_1.default,
                            as: 'faculty',
                            attributes: ['id', 'facultyName', 'isActive']
                        }
                    ],
                    order: [['departmentName', 'ASC']]
                });
                return departments;
            }
            catch (error) {
                throw new Error(`Error fetching departments by faculty: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
}
exports.default = new DepartmentService();
