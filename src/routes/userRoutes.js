"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const UserController_1 = require("../controller/UserController");
const router = express_1.default.Router();
/**
 * @route GET /api/V1/profile
 * @desc Get user's profile
 * @access Private
 * @header Authorization
 * @returns { username, email, role, profile }
 */
router.get('/v1/user-profile', AuthMiddleware_1.AuthMiddleware.authenticateToken, UserController_1.UserController.getUserProfile);
exports.default = router;
