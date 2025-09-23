"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SessionController_1 = require("../controller/SessionController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
// All session routes require authentication
router.use(AuthMiddleware_1.AuthMiddleware.authenticateToken);
// Get all active sessions for the logged-in user
router.get('/sessions', SessionController_1.SessionController.getUserSessions);
// Get current session info
router.get('/sessions/current', SessionController_1.SessionController.getCurrentSession);
// Logout from a specific session
router.delete('/sessions/:sessionId', SessionController_1.SessionController.logoutSpecificSession);
// Logout from all other sessions (keep current session active)
router.post('/sessions/logout-others', SessionController_1.SessionController.logoutAllOtherSessions);
// Logout from all sessions (including current)
router.post('/sessions/logout-all', SessionController_1.SessionController.logoutAllSessions);
exports.default = router;
