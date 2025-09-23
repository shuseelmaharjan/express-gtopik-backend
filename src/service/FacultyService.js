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
exports.FacultyService = void 0;
const Faculty_1 = __importDefault(require("../models/Faculty"));
const sequelize_1 = require("sequelize");
class FacultyService {
    /**
     * Create a new faculty
     */
    static createFaculty(facultyName, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculty = yield Faculty_1.default.create({
                    facultyName,
                    createdBy: userId,
                    updatedBy: userId,
                    isActive: true
                });
                return faculty;
            }
            catch (error) {
                console.error('Error creating faculty:', error);
                throw new Error('Failed to create faculty');
            }
        });
    }
    /**
     * Get all faculties
     */
    static getAllFaculties() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculties = yield Faculty_1.default.findAll({
                    order: [['createdAt', 'DESC']]
                });
                return faculties;
            }
            catch (error) {
                console.error('Error fetching faculties:', error);
                throw new Error('Failed to fetch faculties');
            }
        });
    }
    /**
     * Get faculty by ID
     */
    static getFacultyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculty = yield Faculty_1.default.findByPk(id);
                return faculty;
            }
            catch (error) {
                console.error('Error fetching faculty by ID:', error);
                throw new Error('Failed to fetch faculty');
            }
        });
    }
    /**
     * Update faculty name
     */
    static updateFacultyName(id, facultyName, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculty = yield Faculty_1.default.findByPk(id);
                if (!faculty) {
                    return null;
                }
                faculty.facultyName = facultyName;
                faculty.updatedBy = userId;
                faculty.updatedAt = new Date();
                yield faculty.save();
                return faculty;
            }
            catch (error) {
                console.error('Error updating faculty name:', error);
                throw new Error('Failed to update faculty name');
            }
        });
    }
    /**
     * Update faculty status (isActive)
     */
    static updateFacultyStatus(id, isActive, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const faculty = yield Faculty_1.default.findByPk(id);
                if (!faculty) {
                    return null;
                }
                faculty.isActive = isActive;
                faculty.updatedBy = userId;
                faculty.updatedAt = new Date();
                yield faculty.save();
                return faculty;
            }
            catch (error) {
                console.error('Error updating faculty status:', error);
                throw new Error('Failed to update faculty status');
            }
        });
    }
    /**
     * Check if faculty name already exists (for validation)
     */
    static facultyNameExists(facultyName, excludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereCondition = { facultyName };
                if (excludeId) {
                    whereCondition.id = { [sequelize_1.Op.ne]: excludeId };
                }
                const faculty = yield Faculty_1.default.findOne({
                    where: whereCondition
                });
                return faculty !== null;
            }
            catch (error) {
                console.error('Error checking faculty name existence:', error);
                throw new Error('Failed to validate faculty name');
            }
        });
    }
}
exports.FacultyService = FacultyService;
