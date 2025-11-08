import Ads from '../models/Ads';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class AdsService {
    // Create a new Ad
    async createAd(
        image: string,
        title: string,
        subtitle: string,
        link: string,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newAd = await Ads.create({
                image,
                title,
                subtitle,
                link,
                createdBy,
                isActive: true,
                updatedBy: null
            });

            return newAd;
        } catch (error) {
            console.error('Error in createAd service:', error);
            throw error;
        }
    }

    // Get all active ads
    async getAllActiveAds() {
        try {
            const ads = await Ads.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each ad with creator and updater information
            const enhancedAds = await Promise.all(
                ads.map(async (ad: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(ad.createdBy));
                    const updatedByUser = ad.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(ad.updatedBy))
                        : null;

                    return {
                        ...ad.toJSON(),
                        image: `${process.env.SERVER_URL}${ad.image}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedAds;
        } catch (error) {
            console.error('Error in getAllActiveAds service:', error);
            throw error;
        }
    }

    // Get all ads (including inactive)
    async getAllAds() {
        try {
            const ads = await Ads.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each ad with creator and updater information
            const enhancedAds = await Promise.all(
                ads.map(async (ad: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(ad.createdBy));
                    const updatedByUser = ad.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(ad.updatedBy))
                        : null;

                    return {
                        ...ad.toJSON(),
                        image: `${process.env.SERVER_URL}${ad.image}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedAds;
        } catch (error) {
            console.error('Error in getAllAds service:', error);
            throw error;
        }
    }

    // Get ad by ID
    async getAdById(id: number) {
        try {
            const ad = await Ads.findByPk(id);
            if (!ad) {
                throw new Error('Ad not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(ad.createdBy));
            const updatedByUser = ad.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(ad.updatedBy))
                : null;

            // Return ad with full name information and full image URL
            return {
                ...ad.toJSON(),
                image: `${process.env.SERVER_URL}${ad.image}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getAdById service:', error);
            throw error;
        }
    }

    // Update ad
    async updateAd(
        id: number,
        image?: string,
        title?: string,
        subtitle?: string,
        link?: string,
        updatedBy?: string
    ) {
        try {
            const existingAd = await Ads.findByPk(id);
            if (!existingAd) {
                throw new Error('Ad not found');
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

            if (image !== undefined) updateData.image = image;
            if (title !== undefined) updateData.title = title;
            if (subtitle !== undefined) updateData.subtitle = subtitle;
            if (link !== undefined) updateData.link = link;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingAd.update(updateData);

            // Return updated ad with user information
            return await this.getAdById(id);
        } catch (error) {
            console.error('Error in updateAd service:', error);
            throw error;
        }
    }

    // Deactivate ad (soft delete)
    async deactivateAd(id: number, updatedBy: string) {
        try {
            const ad = await Ads.findByPk(id);
            if (!ad) {
                throw new Error('Ad not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await ad.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return ad;
        } catch (error) {
            console.error('Error in deactivateAd service:', error);
            throw error;
        }
    }

    // Permanently delete ad
    async deleteAd(id: number) {
        try {
            const ad = await Ads.findByPk(id);
            if (!ad) {
                throw new Error('Ad not found');
            }

            await ad.destroy();
            return { message: 'Ad permanently deleted' };
        } catch (error) {
            console.error('Error in deleteAd service:', error);
            throw error;
        }
    }
}

const adsService = new AdsService();
export default adsService;