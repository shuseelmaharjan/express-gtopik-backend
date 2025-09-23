"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const DateTimeHelper_1 = require("../utils/DateTimeHelper");
const sequelize_1 = require("sequelize");
const SessionService_1 = require("./SessionService");
class AuthService {
    static login(credentials, request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identifier, password } = credentials;
                // Try username first, then email
                const user = yield User_1.default.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { username: identifier },
                            { email: identifier }
                        ]
                    }
                });
                if (!user) {
                    return {
                        success: false,
                        message: 'Invalid username/email or password'
                    };
                }
                if (!user.isActive) {
                    return {
                        success: false,
                        message: 'Account is deactivated. Please contact administrator.'
                    };
                }
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    return {
                        success: false,
                        message: 'Invalid username/email or password'
                    };
                }
                const accessToken = this.generateAccessToken(user);
                const refreshToken = this.generateRefreshToken(user);
                // Create session record if request object is provided
                let sessionInfo;
                if (request) {
                    try {
                        const session = yield SessionService_1.SessionService.createSession(user.id, accessToken, request, refreshToken);
                        sessionInfo = {
                            sessionId: session.sessionId,
                            deviceInfo: session.deviceInfo,
                            browserInfo: session.browserInfo
                        };
                    }
                    catch (sessionError) {
                        console.error('Failed to create session:', sessionError);
                        // Continue with login even if session creation fails
                    }
                }
                return {
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            isActive: user.isActive
                        },
                        accessToken,
                        sessionInfo
                    },
                    refreshToken
                };
            }
            catch (error) {
                console.error('Login error:', error);
                return {
                    success: false,
                    message: 'Internal server error. Please try again later.'
                };
            }
        });
    }
    /**
     * Generate access token using JWT (3 hours expiry)
     */
    static generateAccessToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            type: 'access'
        };
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
        }
        return jwt.sign(payload, secret, {
            expiresIn: '3h',
            issuer: 'golden-server',
            audience: 'golden-client'
        });
    }
    /**
     * Generate refresh token using JWT (15 days expiry)
     */
    static generateRefreshToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            type: 'refresh'
        };
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }
        return jwt.sign(payload, secret, {
            expiresIn: '15d',
            issuer: 'golden-server',
            audience: 'golden-client'
        });
    }
    /**
     * Verify access token using JWT
     */
    static verifyAccessToken(token) {
        try {
            const secret = process.env.JWT_ACCESS_SECRET;
            if (!secret) {
                throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
            }
            const decoded = jwt.verify(token, secret, {
                issuer: 'golden-server',
                audience: 'golden-client'
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Access token has expired');
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            else {
                throw new Error('Access token verification failed');
            }
        }
    }
    /**
     * Verify refresh token using JWT
     */
    static verifyRefreshToken(token) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET;
            if (!secret) {
                throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
            }
            const decoded = jwt.verify(token, secret, {
                issuer: 'golden-server',
                audience: 'golden-client'
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Refresh token has expired');
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            else {
                throw new Error('Refresh token verification failed');
            }
        }
    }
    /**
     * Generate new access token using refresh token
     */
    static refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = this.verifyRefreshToken(refreshToken);
                const user = yield User_1.default.findByPk(decoded.id);
                if (!user || !user.isActive) {
                    return {
                        success: false,
                        message: 'User not found or inactive'
                    };
                }
                const newAccessToken = this.generateAccessToken(user);
                // console.log(`Token refreshed for user: ${user.username} at ${DateTimeHelper.getDateTime()}`);
                return {
                    success: true,
                    message: 'Token refreshed successfully',
                    data: {
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            isActive: user.isActive
                        },
                        accessToken: newAccessToken
                    },
                    refreshToken: refreshToken
                };
            }
            catch (error) {
                console.error('Token refresh error:', error);
                return {
                    success: false,
                    message: 'Invalid or expired refresh token'
                };
            }
        });
    }
    /**
     * Change user password
     */
    static changePassword(userId, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { currentPassword, newPassword, confirmPassword } = credentials;
                // Validate input
                if (!currentPassword || !newPassword || !confirmPassword) {
                    return {
                        success: false,
                        message: 'All password fields are required'
                    };
                }
                if (newPassword !== confirmPassword) {
                    return {
                        success: false,
                        message: 'New password and confirm password do not match'
                    };
                }
                if (newPassword.length < 6) {
                    return {
                        success: false,
                        message: 'New password must be at least 6 characters long'
                    };
                }
                if (currentPassword === newPassword) {
                    return {
                        success: false,
                        message: 'New password must be different from current password'
                    };
                }
                // Find user
                const user = yield User_1.default.findByPk(userId);
                if (!user) {
                    return {
                        success: false,
                        message: 'User not found'
                    };
                }
                // Verify current password
                const isCurrentPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    return {
                        success: false,
                        message: 'Current password is incorrect'
                    };
                }
                // Hash new password
                const saltRounds = 12;
                const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, saltRounds);
                // Update password in database
                yield User_1.default.update({ password: hashedNewPassword }, { where: { id: userId } });
                console.log(`Password changed for user ID: ${userId} at ${DateTimeHelper_1.DateTimeHelper.getDateTime()}`);
                return {
                    success: true,
                    message: 'Password changed successfully'
                };
            }
            catch (error) {
                console.error('Change password error:', error);
                return {
                    success: false,
                    message: 'Failed to change password. Please try again.'
                };
            }
        });
    }
    /**
     * Logout user (invalidate tokens)
     */
    static logout() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`User logout at ${DateTimeHelper_1.DateTimeHelper.getDateTime()}`);
                // In the future, you can implement token blacklisting here
                // For now, we'll just return success as the cookie will be cleared on client side
                // Possible enhancements:
                // 1. Add token to blacklist in database
                // 2. Store active sessions in Redis
                // 3. Add logout timestamp to user record
                return {
                    success: true,
                    message: 'Logged out successfully'
                };
            }
            catch (error) {
                console.error('Logout service error:', error);
                return {
                    success: false,
                    message: 'Logout failed. Please try again.'
                };
            }
        });
    }
}
exports.AuthService = AuthService;
