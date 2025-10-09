import User from '../models/User';

export class UserHelper{

    static async getUserById(userId: number): Promise<User | null>{
        try{
            const user = await User.findByPk(userId);
            const userData = {
                id: user?.id,
                firstName: user?.firstName,
                middleName: user?.middleName,
                lastName: user?.lastName,
            }
            return userData as User;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            return null;
        }
    }
}