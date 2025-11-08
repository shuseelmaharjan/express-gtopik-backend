import AboutCompany from '../models/AboutCompany';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class AboutCompanyService {
    // Create a new AboutCompany
    async createAboutCompany(
        description: string,
        mission: string,
        vision: string,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newAboutCompany = await AboutCompany.create({
                description,
                mission,
                vision,
                createdBy,
                isActive: true,
                updatedBy: null
            });

            return newAboutCompany;
        } catch (error) {
            console.error('Error in createAboutCompany service:', error);
            throw error;
        }
    }

    // Get all active about company records
    async getAllActiveAboutCompany() {
        try {
            const aboutCompanyRecords = await AboutCompany.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each record with creator and updater information
            const enhancedRecords = await Promise.all(
                aboutCompanyRecords.map(async (record: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(record.createdBy));
                    const updatedByUser = record.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(record.updatedBy))
                        : null;

                    return {
                        ...record.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedRecords;
        } catch (error) {
            console.error('Error in getAllActiveAboutCompany service:', error);
            throw error;
        }
    }

    // Get all about company records (including inactive)
    async getAllAboutCompany() {
        try {
            const aboutCompanyRecords = await AboutCompany.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each record with creator and updater information
            const enhancedRecords = await Promise.all(
                aboutCompanyRecords.map(async (record: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(record.createdBy));
                    const updatedByUser = record.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(record.updatedBy))
                        : null;

                    return {
                        ...record.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedRecords;
        } catch (error) {
            console.error('Error in getAllAboutCompany service:', error);
            throw error;
        }
    }

    // Get about company by ID
    async getAboutCompanyById(id: number) {
        try {
            const aboutCompany = await AboutCompany.findByPk(id);
            if (!aboutCompany) {
                throw new Error('About Company record not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(aboutCompany.createdBy));
            const updatedByUser = aboutCompany.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(aboutCompany.updatedBy))
                : null;

            // Return about company with full name information
            return {
                ...aboutCompany.toJSON(),
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getAboutCompanyById service:', error);
            throw error;
        }
    }

    // Update about company
    async updateAboutCompany(
        id: number,
        description?: string,
        mission?: string,
        vision?: string,
        updatedBy?: string
    ) {
        try {
            const existingAboutCompany = await AboutCompany.findByPk(id);
            if (!existingAboutCompany) {
                throw new Error('About Company record not found');
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

            if (description !== undefined) updateData.description = description;
            if (mission !== undefined) updateData.mission = mission;
            if (vision !== undefined) updateData.vision = vision;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingAboutCompany.update(updateData);

            // Return updated record with user information
            return await this.getAboutCompanyById(id);
        } catch (error) {
            console.error('Error in updateAboutCompany service:', error);
            throw error;
        }
    }

    // Deactivate about company (soft delete)
    async deactivateAboutCompany(id: number, updatedBy: string) {
        try {
            const aboutCompany = await AboutCompany.findByPk(id);
            if (!aboutCompany) {
                throw new Error('About Company record not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await aboutCompany.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return aboutCompany;
        } catch (error) {
            console.error('Error in deactivateAboutCompany service:', error);
            throw error;
        }
    }

    // Permanently delete about company
    async deleteAboutCompany(id: number) {
        try {
            const aboutCompany = await AboutCompany.findByPk(id);
            if (!aboutCompany) {
                throw new Error('About Company record not found');
            }

            await aboutCompany.destroy();
            return { message: 'About Company record permanently deleted' };
        } catch (error) {
            console.error('Error in deleteAboutCompany service:', error);
            throw error;
        }
    }
}

const aboutCompanyService = new AboutCompanyService();
export default aboutCompanyService;