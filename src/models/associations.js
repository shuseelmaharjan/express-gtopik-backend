"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = exports.Class = exports.Shifts = exports.Courses = exports.User = exports.Department = exports.Faculty = void 0;
const Faculty_1 = __importDefault(require("./Faculty"));
exports.Faculty = Faculty_1.default;
const Department_1 = __importDefault(require("./Department"));
exports.Department = Department_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Courses_1 = __importDefault(require("./Courses"));
exports.Courses = Courses_1.default;
const Shifts_1 = __importDefault(require("./Shifts"));
exports.Shifts = Shifts_1.default;
const Class_1 = __importDefault(require("./Class"));
exports.Class = Class_1.default;
const UserSession_1 = __importDefault(require("./UserSession"));
exports.UserSession = UserSession_1.default;
// Faculty - Department associations
Faculty_1.default.hasMany(Department_1.default, {
    foreignKey: 'facultyId',
    as: 'departments'
});
Department_1.default.belongsTo(Faculty_1.default, {
    foreignKey: 'facultyId',
    as: 'faculty'
});
// User - UserSession associations
User_1.default.hasMany(UserSession_1.default, {
    foreignKey: 'userId',
    as: 'sessions'
});
UserSession_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user'
});
