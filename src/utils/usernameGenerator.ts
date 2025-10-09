import User from '../models/User';
import { Op } from 'sequelize';

export class UsernameGenerator {
    /**
     * Generates unique username in format USERNAME_PREFIX-YYYY-X
     * Where X is incremented from the highest existing number for current year
     * If it's a new year, X starts from 1
     */
    static async generateUniqueUsername(): Promise<string> {
        const currentYear = new Date().getFullYear();
        const prefix = `${process.env.USERNAME_PREFIX}-${currentYear}-`;
        
        try {
            // Find all usernames with current year prefix
            const existingUsers = await User.findAll({
                where: {
                    username: {
                        [Op.like]: `${prefix}%`
                    }
                },
                attributes: ['username'],
                order: [['username', 'DESC']]
            });
            
            let nextNumber = 1;
            
            if (existingUsers.length > 0) {
                // Extract numbers from existing usernames and find the highest
                const numbers = existingUsers
                    .map(user => user.username)
                    .map(username => {
                        const match = username.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`));
                        return match ? parseInt(match[1], 10) : 0;
                    })
                    .filter(num => !isNaN(num) && num > 0);
                
                if (numbers.length > 0) {
                    const highestNumber = Math.max(...numbers);
                    nextNumber = highestNumber + 1;
                }
            }
            
            const newUsername = `${prefix}${nextNumber}`;
            
            // Double-check uniqueness (edge case protection)
            const existingUser = await User.findOne({
                where: { username: newUsername }
            });
            
            if (existingUser) {
                // If somehow the username exists, recursively try the next number
                console.warn(`Username ${newUsername} already exists, trying next number`);
                return await this.generateUniqueUsernameWithIncrement(prefix, nextNumber + 1);
            }
            
            return newUsername;
            
        } catch (error) {
            console.error('Error generating username:', error);
            throw new Error('Failed to generate unique username');
        }
    }
    
    /**
     * Helper method to recursively find available username with incremented number
     */
    private static async generateUniqueUsernameWithIncrement(prefix: string, startNumber: number): Promise<string> {
        const username = `${prefix}${startNumber}`;
        
        const existingUser = await User.findOne({
            where: { username }
        });
        
        if (existingUser) {
            return await this.generateUniqueUsernameWithIncrement(prefix, startNumber + 1);
        }
        
        return username;
    }
}