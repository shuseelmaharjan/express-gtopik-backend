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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyController = void 0;
const FacultyService_1 = require("../service/FacultyService");
class FacultyController {
    /**
     * @desc Create a new faculty
     * @route POST /api/v1/faculty
     * @access Private (Admin/SuperAdmin)
     */
    static createFaculty(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { facultyName } = req.body;
                const userId = req.user.id;
                // Validation
                if (!facultyName || facultyName.trim() === '') {
                    res.status(400).json({
                        success: false,
                        message: "Faculty name is required",
                        data: {}
                    });
                    return;
                }
                // Check if faculty name already exists
                const nameExists = yield FacultyService_1.FacultyService.facultyNameExists(facultyName.trim());
                if (nameExists) {
                    res.status(409).json({
                        success: false,
                        message: "Faculty name already exists",
                        data: {}
                    });
                    return;
                }
                const faculty = yield FacultyService_1.FacultyService.createFaculty(facultyName.trim(), userId);
                res.status(201).json({
                    success: true,
                    message: "Faculty created successfully",
                    data: faculty
                });
            }
            catch (error) {
                console.error("Error in createFaculty controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    data: {}
                });
            }
        });
    }
    /**
     * @desc Get all faculties
     * @route GET /api/v1/faculty
     * @access Private
     */
    static getAllFaculties(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculties = yield FacultyService_1.FacultyService.getAllFaculties();
                res.status(200).json({
                    success: true,
                    message: "Faculties fetched successfully",
                    data: faculties
                });
            }
            catch (error) {
                console.error("Error in getAllFaculties controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    data: {}
                });
            }
        });
    }
    /**
     * @desc Get faculty by ID
     * @route GET /api/v1/faculty/:id
     * @access Private
     */
    static getFacultyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const facultyId = parseInt(id);
                if (isNaN(facultyId)) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid faculty ID",
                        data: {}
                    });
                    return;
                }
                const faculty = yield FacultyService_1.FacultyService.getFacultyById(facultyId);
                if (!faculty) {
                    res.status(404).json({
                        success: false,
                        message: "Faculty not found",
                        data: {}
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Faculty fetched successfully",
                    data: faculty
                });
            }
            catch (error) {
                console.error("Error in getFacultyById controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    data: {}
                });
            }
        });
    }
    /**
     * @desc Update faculty name
     * @route PUT /api/v1/faculty/:id/name
     * @access Private (Admin/SuperAdmin)
     */
    static updateFacultyName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { facultyName } = req.body;
                const userId = req.user.id;
                const facultyId = parseInt(id);
                // Validation
                if (isNaN(facultyId)) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid faculty ID",
                        data: {}
                    });
                    return;
                }
                if (!facultyName || facultyName.trim() === '') {
                    res.status(400).json({
                        success: false,
                        message: "Faculty name is required",
                        data: {}
                    });
                    return;
                }
                // Check if faculty name already exists (excluding current faculty)
                const nameExists = yield FacultyService_1.FacultyService.facultyNameExists(facultyName.trim(), facultyId);
                if (nameExists) {
                    res.status(409).json({
                        success: false,
                        message: "Faculty name already exists",
                        data: {}
                    });
                    return;
                }
                const faculty = yield FacultyService_1.FacultyService.updateFacultyName(facultyId, facultyName.trim(), userId);
                if (!faculty) {
                    res.status(404).json({
                        success: false,
                        message: "Faculty not found",
                        data: {}
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Faculty name updated successfully",
                    data: faculty
                });
            }
            catch (error) {
                console.error("Error in updateFacultyName controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    data: {}
                });
            }
        });
    }
    /**
     * @desc Update faculty status (activate/deactivate)
     * @route PUT /api/v1/faculty/:id/status
     * @access Private (Admin/SuperAdmin)
     */
    static updateFacultyStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { isActive } = req.body;
                const userId = req.user.id;
                const facultyId = parseInt(id);
                // Validation
                if (isNaN(facultyId)) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid faculty ID",
                        data: {}
                    });
                    return;
                }
                if (typeof isActive !== 'boolean') {
                    res.status(400).json({
                        success: false,
                        message: "isActive must be a boolean value",
                        data: {}
                    });
                    return;
                }
                const faculty = yield FacultyService_1.FacultyService.updateFacultyStatus(facultyId, isActive, userId);
                if (!faculty) {
                    res.status(404).json({
                        success: false,
                        message: "Faculty not found",
                        data: {}
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: `Faculty ${isActive ? 'activated' : 'deactivated'} successfully`,
                    data: faculty
                });
            }
            catch (error) {
                console.error("Error in updateFacultyStatus controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    data: {}
                });
            }
        });
    }
}
exports.FacultyController = FacultyController;
