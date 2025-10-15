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

    // get full name by userId in merge of firstName, middleName and lastName
    static async getUserFullNameById(userId: number): Promise<{id: number, fullName: string} | null>{
        try{
            const user = await User.findByPk(userId);
            if(!user){
                return null;
            }
            const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
            return {
                id: user.id,
                fullName: fullName
            };

        } catch (error) {
            console.error("Error fetching user full name by ID:", error);
            return null;
        }
    }
}