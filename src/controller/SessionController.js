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
exports.SessionController = void 0;
const SessionService_1 = require("../service/SessionService");
const uidHelper_1 = __importDefault(require("../utils/uidHelper"));
class SessionController {
    // Get all active sessions for the logged-in user
    static getUserSessions(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                const userId = uidHelper_1.default.extractUserIdFromToken(accessToken);
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                    return;
                }
                const sessions = yield SessionService_1.SessionService.getUserActiveSessions(parseInt(userId));
                res.status(200).json({
                    success: true,
                    message: 'Active sessions retrieved successfully',
                    data: sessions
                });
            }
            catch (error) {
                console.error('Error getting user sessions:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    // Logout from a specific session
    static logoutSpecificSession(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                const userId = uidHelper_1.default.extractUserIdFromToken(accessToken);
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                    return;
                }
                if (!sessionId) {
                    res.status(400).json({
                        success: false,
                        message: 'Session ID is required'
                    });
                    return;
                }
                const success = yield SessionService_1.SessionService.logoutSession(sessionId, parseInt(userId));
                if (!success) {
                    res.status(404).json({
                        success: false,
                        message: 'Session not found or already logged out'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Session logged out successfully'
                });
            }
            catch (error) {
                console.error('Error logging out session:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    // Logout from all other sessions (keep current session active)
    static logoutAllOtherSessions(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                const userId = uidHelper_1.default.extractUserIdFromToken(accessToken);
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                    return;
                }
                // Get current session to keep it active
                const currentSession = yield SessionService_1.SessionService.getSessionByToken(accessToken);
                if (!currentSession) {
                    res.status(401).json({
                        success: false,
                        message: 'Current session not found'
                    });
                    return;
                }
                const loggedOutCount = yield SessionService_1.SessionService.logoutAllOtherSessions(parseInt(userId), currentSession.sessionId);
                res.status(200).json({
                    success: true,
                    message: `Logged out from ${loggedOutCount} other sessions successfully`
                });
            }
            catch (error) {
                console.error('Error logging out all other sessions:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    // Logout from all sessions (including current)
    static logoutAllSessions(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                const userId = uidHelper_1.default.extractUserIdFromToken(accessToken);
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                    return;
                }
                const loggedOutCount = yield SessionService_1.SessionService.logoutAllSessions(parseInt(userId));
                res.status(200).json({
                    success: true,
                    message: `Logged out from all ${loggedOutCount} sessions successfully`
                });
            }
            catch (error) {
                console.error('Error logging out all sessions:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
    // Get current session info
    static getCurrentSession(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!accessToken) {
                    res.status(401).json({
                        success: false,
                        message: 'No access token provided'
                    });
                    return;
                }
                const session = yield SessionService_1.SessionService.getSessionByToken(accessToken);
                if (!session) {
                    res.status(401).json({
                        success: false,
                        message: 'Session not found or expired'
                    });
                    return;
                }
                // Return session info without sensitive data
                const sessionInfo = {
                    sessionId: session.sessionId,
                    deviceInfo: session.deviceInfo,
                    browserInfo: session.browserInfo,
                    deviceType: session.deviceType,
                    platform: session.platform,
                    ipAddress: session.ipAddress,
                    lastActivity: session.lastActivity,
                    loginTime: session.loginTime
                };
                res.status(200).json({
                    success: true,
                    message: 'Current session retrieved successfully',
                    data: sessionInfo
                });
            }
            catch (error) {
                console.error('Error getting current session:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        });
    }
}
exports.SessionController = SessionController;
