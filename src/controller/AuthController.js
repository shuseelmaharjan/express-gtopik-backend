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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../service/AuthService");
const uidHelper_1 = __importDefault(require("../utils/uidHelper"));
class AuthController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    console.log('Request body is missing or undefined');
                    res.status(400).json({
                        success: false,
                        message: 'Request body is required. Please send JSON data with Content-Type: application/json'
                    });
                    return;
                }
                if (typeof req.body !== 'object') {
                    console.log('Request body is not an object:', typeof req.body);
                    res.status(400).json({
                        success: false,
                        message: 'Invalid request data format. Expected JSON object'
                    });
                    return;
                }
                const { identifier, password } = req.body;
                if (!identifier || !password ||
                    typeof identifier !== "string" || typeof password !== "string" ||
                    identifier.trim() === "" || password.trim() === "") {
                    res.status(400).json({
                        success: false,
                        message: 'Username/email and password are required.'
                    });
                    return;
                }
                const result = yield AuthService_1.AuthService.login({
                    identifier: identifier.trim(),
                    password: password.trim()
                }, req);
                if (result.success && result.refreshToken) {
                    res.cookie('refreshToken', result.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 24 * 60 * 60 * 1000,
                        path: '/'
                    });
                    res.cookie("session", true, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 24 * 60 * 60 * 1000,
                        path: '/'
                    });
                    const { refreshToken } = result, responseWithoutRefreshToken = __rest(result, ["refreshToken"]);
                    const statusCode = result.success ? 200 : 401;
                    res.status(statusCode).json(responseWithoutRefreshToken);
                }
                else {
                    const statusCode = result.success ? 200 : 401;
                    res.status(statusCode).json(result);
                }
            }
            catch (error) {
                console.error('Login controller error:', error);
                console.error('Error stack:', error.stack);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    static refreshToken(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("Cookie received:", req.cookies);
            try {
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                // console.log('Received refresh token:', refreshToken);
                if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
                    res.status(400).json({
                        success: false,
                        message: 'Refresh token not found. Please login again.'
                    });
                    return;
                }
                const result = yield AuthService_1.AuthService.refreshAccessToken(refreshToken.trim());
                if (result.success && result.refreshToken) {
                    res.cookie('refreshToken', result.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 15 * 24 * 60 * 60 * 1000,
                        path: '/'
                    });
                    const { refreshToken: _ } = result, responseWithoutRefreshToken = __rest(result, ["refreshToken"]);
                    const statusCode = result.success ? 200 : 401;
                    res.status(statusCode).json(responseWithoutRefreshToken);
                }
                else {
                    const statusCode = result.success ? 200 : 401;
                    res.status(statusCode).json(result);
                }
            }
            catch (error) {
                console.error('Token refresh controller error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Logout attempt received');
                const result = yield AuthService_1.AuthService.logout();
                if (result.success) {
                    res.clearCookie('refreshToken', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/'
                    });
                    console.log('Refresh token cookie cleared');
                }
                const statusCode = result.success ? 200 : 500;
                res.status(statusCode).json(result);
            }
            catch (error) {
                console.error('Logout controller error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    static changePassword(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get access token from authorization header
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                // Extract user ID from token
                const userId = uidHelper_1.default.extractUserIdFromToken(accessToken);
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                    return;
                }
                // Validate request body
                if (!req.body) {
                    res.status(400).json({
                        success: false,
                        message: 'Request body is required'
                    });
                    return;
                }
                const { currentPassword, newPassword, confirmPassword } = req.body;
                // Validate required fields
                if (!currentPassword || !newPassword || !confirmPassword) {
                    res.status(400).json({
                        success: false,
                        message: 'Current password, new password, and confirm password are required'
                    });
                    return;
                }
                // Validate data types
                if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
                    res.status(400).json({
                        success: false,
                        message: 'All password fields must be strings'
                    });
                    return;
                }
                // Call service method
                const result = yield AuthService_1.AuthService.changePassword(parseInt(userId), {
                    currentPassword: currentPassword.trim(),
                    newPassword: newPassword.trim(),
                    confirmPassword: confirmPassword.trim()
                });
                const statusCode = result.success ? 200 : 400;
                res.status(statusCode).json(result);
            }
            catch (error) {
                console.error('Change password controller error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
}
exports.AuthController = AuthController;
