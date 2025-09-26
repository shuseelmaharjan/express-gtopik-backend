import UserSession from '../models/UserSession';
import User from '../models/User';
import { Op } from 'sequelize';
import sequelize from '../config/database';

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
    static async updateLastActivity(sessionId: string, throttleSeconds: number = 15) {
        // Throttle updates: only update if lastActivity older than throttleSeconds
        // Also add retry logic for lock wait timeouts.
        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                // Use raw query to leverage conditional update; LIMIT 1 to reduce locking window
                const [result]: any = await sequelize.query(
                    `UPDATE tbl_user_sessions 
                     SET lastActivity = NOW(), updatedAt = NOW() 
                     WHERE sessionId = :sessionId 
                       AND isActive = 1 
                       AND (lastActivity IS NULL OR lastActivity < (NOW() - INTERVAL :throttle SECOND))
                     LIMIT 1`,
                    {
                        replacements: { sessionId, throttle: throttleSeconds },
                        logging: false
                    }
                );
                // If update executed (even if 0 rows affected) exit loop.
                break;
            } catch (error: any) {
                if (error?.original?.code === 'ER_LOCK_WAIT_TIMEOUT' || error?.parent?.code === 'ER_LOCK_WAIT_TIMEOUT') {
                    attempt++;
                    if (attempt >= maxRetries) {
                        console.warn(`Skipped lastActivity update after lock timeouts for session ${sessionId}`);
                        break;
                    }
                    // Backoff before retry
                    await new Promise(res => setTimeout(res, 50 * attempt));
                    continue;
                }
                console.error('Error updating last activity:', error);
                break; // Non-lock error; do not retry further
            }
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
            const perfEnabled = process.env.PERF_LOG === '1';
            let startAll: [number, number] | null = null;
            let startQuery: [number, number] | null = null;
            if (perfEnabled) {
                startAll = process.hrtime();
                startQuery = process.hrtime();
            }
            const session = await UserSession.findOne({
                where: { accessToken, isActive: true },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: [
                        'id',
                        'firstName',
                        'middleName',
                        'lastName',
                        'email',
                        'username',
                        'role',
                        'status',
                        'isActive',
                        'profilePicture'
                    ]
                }]
            });
            if (perfEnabled && startQuery) {
                const diff = process.hrtime(startQuery);
                const queryMs = diff[0] * 1000 + diff[1] / 1e6;
                console.log(`[PERF][SessionService.getSessionByToken] DB query took ${queryMs.toFixed(2)} ms`);
            }

            if (!session) return null;

            // Fire & forget lastActivity update to avoid blocking request latency
            // (still internally throttled). Errors are swallowed but logged inside method.
            this.updateLastActivity(session.sessionId).catch(() => {/* noop */});

            // Convert to plain object for safer downstream usage
            const plain = session.get({ plain: true }) as any;
            if (plain.user) {
                const u = plain.user;
                u.fullName = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
                // Backward compatibility for any code expecting user.name
                if (!u.name) u.name = u.fullName;
            }
            if (perfEnabled && startAll) {
                const diffAll = process.hrtime(startAll);
                const totalMs = diffAll[0] * 1000 + diffAll[1] / 1e6;
                console.log(`[PERF][SessionService.getSessionByToken] total time ${totalMs.toFixed(2)} ms`);
            }
            return plain;
        } catch (error) {
            console.error('Error getting session by token:', error);
            return null;
        }
    }
}