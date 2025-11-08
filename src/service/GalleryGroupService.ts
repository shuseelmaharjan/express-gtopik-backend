import GalleryGroup from '../models/GalleryGroup';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class GalleryGroupService {
    // Create a new Gallery Group
    async createGalleryGroup(
        name: string,
        description: string | null,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newGalleryGroup = await GalleryGroup.create({
                name,
                description,
                isActive: true,
                createdBy,
                updatedBy: null
            });

            // Get creator full name
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(createdBy));

            return {
                ...newGalleryGroup.toJSON(),
                createdByUser: createdByUser,
                updatedByUser: null
            };
        } catch (error) {
            console.error('Error in createGalleryGroup service:', error);
            throw error;
        }
    }

    // Get all active gallery groups
    async getAllActiveGalleryGroups() {
        try {
            const galleryGroups = await GalleryGroup.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each gallery group with creator and updater information
            const enhancedGalleryGroups = await Promise.all(
                galleryGroups.map(async (group: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(group.createdBy));
                    const updatedByUser = group.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(group.updatedBy))
                        : null;

                    return {
                        ...group.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedGalleryGroups;
        } catch (error) {
            console.error('Error in getAllActiveGalleryGroups service:', error);
            throw error;
        }
    }

    // Get all gallery groups (including inactive)
    async getAllGalleryGroups() {
        try {
            const galleryGroups = await GalleryGroup.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each gallery group with creator and updater information
            const enhancedGalleryGroups = await Promise.all(
                galleryGroups.map(async (group: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(group.createdBy));
                    const updatedByUser = group.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(group.updatedBy))
                        : null;

                    return {
                        ...group.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedGalleryGroups;
        } catch (error) {
            console.error('Error in getAllGalleryGroups service:', error);
            throw error;
        }
    }

    // Get gallery group by ID
    async getGalleryGroupById(id: number) {
        try {
            const galleryGroup = await GalleryGroup.findByPk(id);
            if (!galleryGroup) {
                throw new Error('Gallery group not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(galleryGroup.createdBy));
            const updatedByUser = galleryGroup.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(galleryGroup.updatedBy))
                : null;

            return {
                ...galleryGroup.toJSON(),
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getGalleryGroupById service:', error);
            throw error;
        }
    }

    // Update gallery group
    async updateGalleryGroup(
        id: number,
        name?: string,
        description?: string | null,
        updatedBy?: string
    ) {
        try {
            const existingGroup = await GalleryGroup.findByPk(id);
            if (!existingGroup) {
                throw new Error('Gallery group not found');
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

            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingGroup.update(updateData);

            // Return updated gallery group with user information
            return await this.getGalleryGroupById(id);
        } catch (error) {
            console.error('Error in updateGalleryGroup service:', error);
            throw error;
        }
    }

    // Deactivate gallery group (soft delete)
    async deactivateGalleryGroup(id: number, updatedBy: string) {
        try {
            const galleryGroup = await GalleryGroup.findByPk(id);
            if (!galleryGroup) {
                throw new Error('Gallery group not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await galleryGroup.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return await this.getGalleryGroupById(id);
        } catch (error) {
            console.error('Error in deactivateGalleryGroup service:', error);
            throw error;
        }
    }

    // Permanently delete gallery group
    async deleteGalleryGroup(id: number) {
        try {
            const galleryGroup = await GalleryGroup.findByPk(id);
            if (!galleryGroup) {
                throw new Error('Gallery group not found');
            }

            await galleryGroup.destroy();
            return { message: 'Gallery group permanently deleted' };
        } catch (error) {
            console.error('Error in deleteGalleryGroup service:', error);
            throw error;
        }
    }
}

const galleryGroupService = new GalleryGroupService();
export default galleryGroupService;
