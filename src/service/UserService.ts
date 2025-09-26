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

    //deactivate user account
    static async deactivateUserAccount(userId: number): Promise<boolean> {
        try{
            const user = await User.findByPk(userId);
            if(!user){
                throw new Error("User not found");
            }
            user.isActive = false;
            await user.save();
            console.log("User ", user.username, " deactivated successfully");
            return true;
        } catch (error) {
            console.error("Error deactivating user account:", error);
            return false;
        }
    }
}