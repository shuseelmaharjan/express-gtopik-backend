import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

class UidHelper {
  /**
   * Extract userId from request headers containing the Authorization token
   * @param headers - The request headers object (should contain 'authorization')
   * @returns userId string or null if token is invalid or not present
   */
  static getUserId(headers: Record<string, any>): string | null {
    try {
      // Get token from Authorization header
      const authHeader = headers['authorization'] || headers['Authorization'];
      if (!authHeader) return null;

      // Remove 'Bearer ' prefix if present
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) return null;

      // Get JWT secret from environment variable
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not set in environment variables");
      }

      // Verify and decode the JWT
      const decoded = jwt.verify(token, secret) as TokenPayload;
      // Return userId if present
      return decoded.id || null;
    } catch (error) {
      console.log('Token verification error:', error);
      return null;
    }
  }
}

export default UidHelper;