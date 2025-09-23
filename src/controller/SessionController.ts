import { Request, Response } from 'express';
import { SessionService } from '../service/SessionService';
import UidHelper from '../utils/uidHelper';

export class SessionController {
    // Get all active sessions for the logged-in user
    static async getUserSessions(req: Request, res: Response): Promise<void> {
        try {
            const accessToken = req.headers.authorization?.split(' ')[1];
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'No access token provided'
                });
                return;
            }

            const userId = UidHelper.extractUserIdFromToken(accessToken);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid access token'
                });
                return;
            }

            const sessions = await SessionService.getUserActiveSessions(parseInt(userId));
            
            res.status(200).json({
                success: true,
                message: 'Active sessions retrieved successfully',
                data: sessions
            });
        } catch (error) {
            console.error('Error getting user sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout from a specific session
    static async logoutSpecificSession(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            const accessToken = req.headers.authorization?.split(' ')[1];
            
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'No access token provided'
                });
                return;
            }

            const userId = UidHelper.extractUserIdFromToken(accessToken);
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

            const success = await SessionService.logoutSession(sessionId, parseInt(userId));
            
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
        } catch (error) {
            console.error('Error logging out session:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout from all other sessions (keep current session active)
    static async logoutAllOtherSessions(req: Request, res: Response): Promise<void> {
        try {
            const accessToken = req.headers.authorization?.split(' ')[1];
            
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'No access token provided'
                });
                return;
            }

            const userId = UidHelper.extractUserIdFromToken(accessToken);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid access token'
                });
                return;
            }

            // Get current session to keep it active
            const currentSession = await SessionService.getSessionByToken(accessToken);
            if (!currentSession) {
                res.status(401).json({
                    success: false,
                    message: 'Current session not found'
                });
                return;
            }

            const loggedOutCount = await SessionService.logoutAllOtherSessions(parseInt(userId), currentSession.sessionId);
            
            res.status(200).json({
                success: true,
                message: `Logged out from ${loggedOutCount} other sessions successfully`
            });
        } catch (error) {
            console.error('Error logging out all other sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout from all sessions (including current)
    static async logoutAllSessions(req: Request, res: Response): Promise<void> {
        try {
            const accessToken = req.headers.authorization?.split(' ')[1];
            
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'No access token provided'
                });
                return;
            }

            const userId = UidHelper.extractUserIdFromToken(accessToken);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid access token'
                });
                return;
            }

            const loggedOutCount = await SessionService.logoutAllSessions(parseInt(userId));
            
            res.status(200).json({
                success: true,
                message: `Logged out from all ${loggedOutCount} sessions successfully`
            });
        } catch (error) {
            console.error('Error logging out all sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get current session info
    static async getCurrentSession(req: Request, res: Response): Promise<void> {
        try {
            const accessToken = req.headers.authorization?.split(' ')[1];
            
            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'No access token provided'
                });
                return;
            }

            const session = await SessionService.getSessionByToken(accessToken);
            
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
        } catch (error) {
            console.error('Error getting current session:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}