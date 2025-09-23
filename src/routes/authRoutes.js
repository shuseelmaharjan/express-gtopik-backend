"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthController_1 = require("../controller/AuthController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
/**
 * @route POST /api/auth/login
 * @desc Login user and get tokens
 * @access Public
 * @body { username: string, password: string }
 */
router.post('/login', AuthController_1.AuthController.login);
/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 * @body { refreshToken: string }
 */
router.post('/refresh', AuthController_1.AuthController.refreshToken);
/**
 * @route POST /api/auth/logout
 * @desc Logout user (token blacklisting)
 * @access Private
 * @body { }
 */
router.post('/logout', AuthController_1.AuthController.logout);
/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private (requires valid access token)
 * @body { currentPassword: string, newPassword: string, confirmPassword: string }
 */
router.post('/change-password', AuthMiddleware_1.AuthMiddleware.authenticateToken, AuthController_1.AuthController.changePassword);
exports.default = router;
