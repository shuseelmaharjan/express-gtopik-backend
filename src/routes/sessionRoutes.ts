import { Router } from 'express';
import { SessionController } from '../controller/SessionController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// All session routes require authentication
router.use(AuthMiddleware.authenticateToken);

// Get all active sessions for the logged-in user
router.get('/sessions', SessionController.getUserSessions);

// Get current session info
router.get('/sessions/current', SessionController.getCurrentSession);

// Logout from a specific session
router.delete('/sessions/:sessionId', SessionController.logoutSpecificSession);

// Logout from all other sessions (keep current session active)
router.post('/sessions/logout-others', SessionController.logoutAllOtherSessions);

// Logout from all sessions (including current)
router.post('/sessions/logout-all', SessionController.logoutAllSessions);

export default router;