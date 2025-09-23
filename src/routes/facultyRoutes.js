"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const FacultyController_1 = require("../controller/FacultyController");
const router = express_1.default.Router();
/**
 * @route POST /api/v1/faculty
 * @desc Create a new faculty
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @body { facultyName: string }
 */
router.post('/v1/faculty', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, FacultyController_1.FacultyController.createFaculty);
/**
 * @route GET /api/v1/faculty
 * @desc Get all faculties
 * @access Private (All authenticated users)
 * @header Authorization
 * @returns Array of faculties
 */
router.get('/v1/faculty', FacultyController_1.FacultyController.getAllFaculties);
/**
 * @route GET /api/v1/faculty/:id
 * @desc Get faculty by ID
 * @access Private (All authenticated users)
 * @header Authorization
 * @param id Faculty ID
 */
router.get('/v1/faculty/:id', AuthMiddleware_1.AuthMiddleware.authenticateToken, FacultyController_1.FacultyController.getFacultyById);
/**
 * @route PUT /api/v1/faculty/:id/name
 * @desc Update faculty name
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @param id Faculty ID
 * @body { facultyName: string }
 */
router.put('/v1/faculty/:id/name', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, FacultyController_1.FacultyController.updateFacultyName);
/**
 * @route PUT /api/v1/faculty/:id/status
 * @desc Update faculty status (activate/deactivate)
 * @access Private (Admin/SuperAdmin only)
 * @header Authorization
 * @param id Faculty ID
 * @body { isActive: boolean }
 */
router.put('/v1/faculty/:id/status', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthMiddleware_1.AuthMiddleware.requireAdmin, FacultyController_1.FacultyController.updateFacultyStatus);
exports.default = router;
