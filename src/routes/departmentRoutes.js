"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DepartmentController_1 = __importDefault(require("../controller/DepartmentController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
// Get all departments - requires admin/superadmin role
router.get('/v1/departments', DepartmentController_1.default.getAllDepartments);
// Get department by ID - requires admin/superadmin role
router.get('/v1/:id', DepartmentController_1.default.getDepartmentById);
// Create new department - requires admin/superadmin role
router.post('/v1/departments', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, DepartmentController_1.default.createDepartment);
// Update department name - requires admin/superadmin role
router.put('/v1/department/:id/update', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, DepartmentController_1.default.updateDepartmentName);
// Update department status (activate/deactivate) - requires admin/superadmin role
router.put('/v1/:id/status', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, DepartmentController_1.default.updateDepartmentStatus);
// Get departments by faculty ID - requires admin/superadmin role
router.get('/v1/departmentsfaculty/:facultyId', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, DepartmentController_1.default.getDepartmentsByFacultyId);
exports.default = router;
