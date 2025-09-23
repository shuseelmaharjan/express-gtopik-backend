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
exports.createSuperAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const DateTimeHelper_1 = require("./DateTimeHelper");
const createSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if superadmin already exists
        const existingSuperAdmin = yield User_1.default.findOne({
            where: { username: 'admin' }
        });
        if (existingSuperAdmin) {
            console.log('Superadmin user already exists');
            return;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash('admin', saltRounds);
        // Get current date using DateTimeHelper
        const joinDate = DateTimeHelper_1.DateTimeHelper.getDateObject(); // Use helper method for database storage
        // Log timezone information for debugging
        DateTimeHelper_1.DateTimeHelper.logTimezoneInfo();
        // Create superadmin user
        yield User_1.default.create({
            name: 'System Administrator',
            email: 'admin@system.com',
            username: 'admin',
            password: hashedPassword,
            role: 'superadmin',
            dateofjoin: joinDate,
            sex: 'male',
            isActive: true
        });
        // console.log('Superadmin user created successfully');
        // console.log('Username: admin');
        // console.log('Password: admin');
        // console.log('Role: superadmin');
        // console.log(`Date of Join: ${DateTimeHelper.formatDate(joinDate)} (${DateTimeHelper.getTimezone()})`);
    }
    catch (error) {
        console.error('Error creating superadmin user:', error);
        throw error;
    }
});
exports.createSuperAdmin = createSuperAdmin;
