"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UidHelper {
    /**
     * Extract userId from request headers containing the Authorization token
     * @param headers - The request headers object (should contain 'authorization')
     * @returns userId string or null if token is invalid or not present
     */
    static getUserId(headers) {
        try {
            // Get token from Authorization header
            const authHeader = headers['authorization'] || headers['Authorization'];
            if (!authHeader)
                return null;
            // Remove 'Bearer ' prefix if present
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            if (!token)
                return null;
            return this.extractUserIdFromToken(token);
        }
        catch (error) {
            console.log('Token verification error:', error);
            return null;
        }
    }
    /**
     * Extract userId directly from access token
     * @param token - The JWT access token
     * @returns userId string or null if token is invalid
     */
    static extractUserIdFromToken(token) {
        try {
            if (!token)
                return null;
            // Get JWT secret from environment variable
            const secret = process.env.JWT_ACCESS_SECRET;
            if (!secret) {
                throw new Error("JWT_ACCESS_SECRET is not set in environment variables");
            }
            // Verify and decode the JWT
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Return userId if present
            return decoded.id || null;
        }
        catch (error) {
            console.log('Token verification error:', error);
            return null;
        }
    }
}
exports.default = UidHelper;
