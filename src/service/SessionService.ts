import UserSession from '../models/UserSession';
import User from '../models/User';
import { Op } from 'sequelize';

export class SessionService {
    // Generate simple UUID alternative
    private static generateSessionId(): string {
        return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2);
    }

    // Simple user agent parser
    private static parseUserAgent(userAgent: string) {
        const ua = userAgent.toLowerCase();
        
        // Detect device type
        let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
        if (/mobile|android|iphone/.test(ua)) deviceType = 'mobile';
        else if (/tablet|ipad/.test(ua)) deviceType = 'tablet';
        
        // Detect browser
        let browser = 'Unknown Browser';
        if (ua.includes('chrome')) browser = 'Chrome';
        else if (ua.includes('firefox')) browser = 'Firefox';
        else if (ua.includes('safari')) browser = 'Safari';
        else if (ua.includes('edge')) browser = 'Edge';
        
        // Detect OS/Platform
        let platform = 'unknown';
        let deviceInfo = 'Unknown Device';
        
        if (ua.includes('windows')) {
            platform = 'windows';
            deviceInfo = 'Windows PC';
        } else if (ua.includes('mac')) {
            platform = 'mac';
            deviceInfo = 'Mac';
        } else if (ua.includes('linux')) {
            platform = 'linux';
            deviceInfo = 'Linux PC';
        } else if (ua.includes('android')) {
            platform = 'android';
            deviceInfo = 'Android Device';
        } else if (ua.includes('iphone')) {
            platform = 'ios';
            deviceInfo = 'iPhone';
        } else if (ua.includes('ipad')) {
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
    static async createSession(userId: number, accessToken: string, request: any, refreshToken?: string) {
        try {
            const sessionId = this.generateSessionId();
            const userAgent = request.headers['user-agent'] || '';
            const ipAddress = request.ip || request.connection.remoteAddress || request.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
            
            // Parse user agent
            const parsed = this.parseUserAgent(userAgent);
            
            const { deviceType, deviceInfo, browserInfo, platform } = parsed;

            const session = await UserSession.create({
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
        } catch (error) {
            console.error('Error creating session:', error);
            throw new Error('Failed to create session');
        }
    }

    // Update last activity for a session
    static async updateLastActivity(sessionId: string) {
        try {
            await UserSession.update(
                { lastActivity: new Date() },
                { where: { sessionId, isActive: true } }
            );
        } catch (error) {
            console.error('Error updating last activity:', error);
        }
    }

    // Get active sessions for a user
    static async getUserActiveSessions(userId: number) {
        try {
            const sessions = await UserSession.findAll({
                where: { userId, isActive: true },
                order: [['lastActivity', 'DESC']],
                attributes: [
                    'id', 'sessionId', 'deviceInfo', 'browserInfo', 
                    'deviceType', 'platform', 'ipAddress', 'lastActivity', 
                    'loginTime'
                ]
            });

            return sessions;
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw new Error('Failed to get user sessions');
        }
    }

    // Logout from a specific session
    static async logoutSession(sessionId: string, userId?: number) {
        try {
            const whereClause: any = { sessionId, isActive: true };
            if (userId) whereClause.userId = userId;

            const result = await UserSession.update(
                { 
                    isActive: false, 
                    logoutTime: new Date() 
                },
                { where: whereClause }
            );

            return result[0] > 0;
        } catch (error) {
            console.error('Error logging out session:', error);
            throw new Error('Failed to logout session');
        }
    }

    // Logout from all sessions except current
    static async logoutAllOtherSessions(userId: number, currentSessionId: string) {
        try {
            const result = await UserSession.update(
                { 
                    isActive: false, 
                    logoutTime: new Date() 
                },
                { 
                    where: { 
                        userId, 
                        sessionId: { [Op.ne]: currentSessionId },
                        isActive: true 
                    } 
                }
            );

            return result[0];
        } catch (error) {
            console.error('Error logging out all other sessions:', error);
            throw new Error('Failed to logout all other sessions');
        }
    }

    // Logout from all sessions
    static async logoutAllSessions(userId: number) {
        try {
            const result = await UserSession.update(
                { 
                    isActive: false, 
                    logoutTime: new Date() 
                },
                { 
                    where: { userId, isActive: true } 
                }
            );

            return result[0];
        } catch (error) {
            console.error('Error logging out all sessions:', error);
            throw new Error('Failed to logout all sessions');
        }
    }

    // Validate session
    static async validateSession(sessionId: string, accessToken: string) {
        try {
            const session = await UserSession.findOne({
                where: { 
                    sessionId, 
                    accessToken,
                    isActive: true 
                }
            });

            if (!session) return null;

            // Update last activity
            await this.updateLastActivity(sessionId);

            return session;
        } catch (error) {
            console.error('Error validating session:', error);
            return null;
        }
    }

    // Clean up expired sessions (older than 30 days inactive)
    static async cleanupExpiredSessions() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await UserSession.update(
                { 
                    isActive: false, 
                    logoutTime: new Date() 
                },
                { 
                    where: { 
                        lastActivity: { [Op.lt]: thirtyDaysAgo },
                        isActive: true 
                    } 
                }
            );

            console.log(`Cleaned up ${result[0]} expired sessions`);
            return result[0];
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
            return 0;
        }
    }

    // Get session by access token
    static async getSessionByToken(accessToken: string) {
        try {
            const session = await UserSession.findOne({
                where: { accessToken, isActive: true },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                }]
            });

            if (session) {
                await this.updateLastActivity(session.sessionId);
            }

            return session;
        } catch (error) {
            console.error('Error getting session by token:', error);
            return null;
        }
    }
}