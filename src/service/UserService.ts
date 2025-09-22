import User from "../models/User";

export class UserService {
    // get user's username, email, role and profile by id
    static async getUserProfile(userId: number): Promise<{ name: string, email: string, username: string, role: string } | null> {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['name', 'email', 'username', 'role']
            });
            return user ? user.get({ plain: true }) as { name: string, email: string, username: string, role: string } : null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }
}