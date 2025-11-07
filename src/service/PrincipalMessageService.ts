import PrincipalMessage from '../models/PrincipalMessage';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class PrincipalMessageService {
    // Create a new Principal Message (only one should exist)
    async createPrincipalMessage(
        principalName: string,
        message: string,
        profilePicture: string,
        createdBy: string
    ) {
        try {
            // Check if a principal message already exists
            const existingMessage = await PrincipalMessage.findOne();
            if (existingMessage) {
                throw new Error('Principal message already exists. Use update instead.');
            }

            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newPrincipalMessage = await PrincipalMessage.create({
                principalName: principalName.trim(),
                message: message.trim(),
                profilePicture,
                isActive: true,  // Always set to true by default
                createdBy,
                updatedBy: null
            });

            // Get creator information
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(newPrincipalMessage.createdBy));

            return {
                ...newPrincipalMessage.toJSON(),
                profilePicture: `${process.env.SERVER_URL}${newPrincipalMessage.profilePicture}`,
                createdByUser: createdByUser,
                updatedByUser: null
            };
        } catch (error) {
            console.error('Error in createPrincipalMessage service:', error);
            throw error;
        }
    }

    // Get the principal message (there should be only one)
    async getPrincipalMessage() {
        try {
            const principalMessage = await PrincipalMessage.findOne({
                where: {
                    isActive: true
                }
            });

            if (!principalMessage) {
                return null; // Return null instead of throwing error
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(principalMessage.createdBy));
            const updatedByUser = principalMessage.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(principalMessage.updatedBy))
                : null;

            return {
                ...principalMessage.toJSON(),
                profilePicture: `${process.env.SERVER_URL}${principalMessage.profilePicture}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getPrincipalMessage service:', error);
            throw error;
        }
    }

    // Update the principal message
    async updatePrincipalMessage(
        id: number,
        principalName?: string,
        message?: string,
        profilePicture?: string,
        updatedBy?: string
    ) {
        try {
            const existingPrincipalMessage = await PrincipalMessage.findByPk(id);
            if (!existingPrincipalMessage) {
                throw new Error('Principal message not found');
            }

            // Validate user exists if updatedBy is provided
            if (updatedBy) {
                const user = await User.findByPk(updatedBy);
                if (!user) {
                    throw new Error('User not found');
                }
            }

            const updateData: any = {
                updatedAt: new Date()
            };

            if (principalName !== undefined) updateData.principalName = principalName.trim();
            if (message !== undefined) updateData.message = message.trim();
            if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingPrincipalMessage.update(updateData);

            // Get creator and updater full names for return
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(existingPrincipalMessage.createdBy));
            const updatedByUser = existingPrincipalMessage.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(existingPrincipalMessage.updatedBy))
                : null;

            return {
                ...existingPrincipalMessage.toJSON(),
                profilePicture: `${process.env.SERVER_URL}${existingPrincipalMessage.profilePicture}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in updatePrincipalMessage service:', error);
            throw error;
        }
    }

    // Hard delete the principal message
    async deletePrincipalMessage(id: number) {
        try {
            const principalMessage = await PrincipalMessage.findByPk(id);
            if (!principalMessage) {
                throw new Error('Principal message not found');
            }

            await principalMessage.destroy();
            return { message: 'Principal message permanently deleted' };
        } catch (error) {
            console.error('Error in deletePrincipalMessage service:', error);
            throw error;
        }
    }
}

const principalMessageService = new PrincipalMessageService();
export default principalMessageService;