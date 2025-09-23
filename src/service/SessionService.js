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
exports.SessionService = void 0;
const UserSession_1 = __importDefault(require("../models/UserSession"));
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
class SessionService {
    // Generate simple UUID alternative
    static generateSessionId() {
        return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2);
    }
    // Simple user agent parser
    static parseUserAgent(userAgent) {
        const ua = userAgent.toLowerCase();
        // Detect device type
        let deviceType = 'desktop';
        if (/mobile|android|iphone/.test(ua))
            deviceType = 'mobile';
        else if (/tablet|ipad/.test(ua))
            deviceType = 'tablet';
        // Detect browser
        let browser = 'Unknown Browser';
        if (ua.includes('chrome'))
            browser = 'Chrome';
        else if (ua.includes('firefox'))
            browser = 'Firefox';
        else if (ua.includes('safari'))
            browser = 'Safari';
        else if (ua.includes('edge'))
            browser = 'Edge';
        // Detect OS/Platform
        let platform = 'unknown';
        let deviceInfo = 'Unknown Device';
        if (ua.includes('windows')) {
            platform = 'windows';
            deviceInfo = 'Windows PC';
        }
        else if (ua.includes('mac')) {
            platform = 'mac';
            deviceInfo = 'Mac';
        }
        else if (ua.includes('linux')) {
            platform = 'linux';
            deviceInfo = 'Linux PC';
        }
        else if (ua.includes('android')) {
            platform = 'android';
            deviceInfo = 'Android Device';
        }
        else if (ua.includes('iphone')) {
            platform = 'ios';
            deviceInfo = 'iPhone';
        }
        else if (ua.includes('ipad')) {
            platform = 'ios';
            deviceInfo = 'iPad';
        }
        return {
            deviceType,
            deviceInfo,
            browserInfo: browser,
            platform
        };
    }
    // Create a new session
    static createSession(userId, accessToken, request, refreshToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = this.generateSessionId();
                const userAgent = request.headers['user-agent'] || '';
                const ipAddress = request.ip || request.connection.remoteAddress || ((_a = request.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || 'unknown';
                // Parse user agent
                const parsed = this.parseUserAgent(userAgent);
                const { deviceType, deviceInfo, browserInfo, platform } = parsed;
                const session = yield UserSession_1.default.create({
                    userId,
                    sessionId,
                    accessToken,
                    refreshToken,
                    deviceInfo,
                    browserInfo,
                    deviceType,
                    platform,
                    ipAddress,
                    userAgent,
                    isActive: true,
                    lastActivity: new Date(),
                    loginTime: new Date()
                });
                return session;
            }
            catch (error) {
                console.error('Error creating session:', error);
                throw new Error('Failed to create session');
            }
        });
    }
    // Update last activity for a session
    static updateLastActivity(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield UserSession_1.default.update({ lastActivity: new Date() }, { where: { sessionId, isActive: true } });
            }
            catch (error) {
                console.error('Error updating last activity:', error);
            }
        });
    }
    // Get active sessions for a user
    static getUserActiveSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessions = yield UserSession_1.default.findAll({
                    where: { userId, isActive: true },
                    order: [['lastActivity', 'DESC']],
                    attributes: [
                        'id', 'sessionId', 'deviceInfo', 'browserInfo',
                        'deviceType', 'platform', 'ipAddress', 'lastActivity',
                        'loginTime'
                    ]
                });
                return sessions;
            }
            catch (error) {
                console.error('Error getting user sessions:', error);
                throw new Error('Failed to get user sessions');
            }
        });
    }
    // Logout from a specific session
    static logoutSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereClause = { sessionId, isActive: true };
                if (userId)
                    whereClause.userId = userId;
                const result = yield UserSession_1.default.update({
                    isActive: false,
                    logoutTime: new Date()
                }, { where: whereClause });
                return result[0] > 0;
            }
            catch (error) {
                console.error('Error logging out session:', error);
                throw new Error('Failed to logout session');
            }
        });
    }
    // Logout from all sessions except current
    static logoutAllOtherSessions(userId, currentSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield UserSession_1.default.update({
                    isActive: false,
                    logoutTime: new Date()
                }, {
                    where: {
                        userId,
                        sessionId: { [sequelize_1.Op.ne]: currentSessionId },
                        isActive: true
                    }
                });
                return result[0];
            }
            catch (error) {
                console.error('Error logging out all other sessions:', error);
                throw new Error('Failed to logout all other sessions');
            }
        });
    }
    // Logout from all sessions
    static logoutAllSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield UserSession_1.default.update({
                    isActive: false,
                    logoutTime: new Date()
                }, {
                    where: { userId, isActive: true }
                });
                return result[0];
            }
            catch (error) {
                console.error('Error logging out all sessions:', error);
                throw new Error('Failed to logout all sessions');
            }
        });
    }
    // Validate session
    static validateSession(sessionId, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield UserSession_1.default.findOne({
                    where: {
                        sessionId,
                        accessToken,
                        isActive: true
                    }
                });
                if (!session)
                    return null;
                // Update last activity
                yield this.updateLastActivity(sessionId);
                return session;
            }
            catch (error) {
                console.error('Error validating session:', error);
                return null;
            }
        });
    }
    // Clean up expired sessions (older than 30 days inactive)
    static cleanupExpiredSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const result = yield UserSession_1.default.update({
                    isActive: false,
                    logoutTime: new Date()
                }, {
                    where: {
                        lastActivity: { [sequelize_1.Op.lt]: thirtyDaysAgo },
                        isActive: true
                    }
                });
                console.log(`Cleaned up ${result[0]} expired sessions`);
                return result[0];
            }
            catch (error) {
                console.error('Error cleaning up expired sessions:', error);
                return 0;
            }
        });
    }
    // Get session by access token
    static getSessionByToken(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield UserSession_1.default.findOne({
                    where: { accessToken, isActive: true },
                    include: [{
                            model: User_1.default,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'role']
                        }]
                });
                if (session) {
                    yield this.updateLastActivity(session.sessionId);
                }
                return session;
            }
            catch (error) {
                console.error('Error getting session by token:', error);
                return null;
            }
        });
    }
}
exports.SessionService = SessionService;
