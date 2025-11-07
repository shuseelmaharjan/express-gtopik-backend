import Banner from '../models/Banner';
import { Op } from 'sequelize';
import User from '../models/User';
import sequelize from '../config/database';
import { UserHelper } from '../utils/userHelper';

class BannerService {
    // Create a new Banner
    async createBanner(
        banner: string,
        title: boolean,
        titleText: string | null,
        subtitle: boolean,
        subtitleText: string | null,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newBanner = await Banner.create({
                banner,
                title,
                titleText,
                subtitle,
                subtitleText,
                createdBy,
                isActive: true,
                updatedBy: null
            });

            return newBanner;
        } catch (error) {
            console.error('Error in createBanner service:', error);
            throw error;
        }
    }

    // Get all active banners
    async getAllActiveBanners() {
        try {
            const banners = await Banner.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']],
                attributes: {
                    include: [
                        [sequelize.fn('CONCAT', process.env.SERVER_URL, sequelize.col('banner')), 'banner']
                    ]
                }
            });

            // Enhance each banner with creator and updater information
            const enhancedBanners = await Promise.all(
                banners.map(async (banner) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(banner.createdBy));
                    const updatedByUser = banner.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(banner.updatedBy))
                        : null;

                    return {
                        ...banner.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedBanners;
        } catch (error) {
            console.error('Error in getAllActiveBanners service:', error);
            throw error;
        }
    }

    // Get all banners (including inactive)
    async getAllBanners() {
        try {
            const banners = await Banner.findAll({
                order: [['createdAt', 'DESC']]
            });
            return banners;
        } catch (error) {
            console.error('Error in getAllBanners service:', error);
            throw error;
        }
    }

    // Get banner by ID
    async getBannerById(id: number) {
        try {
            const banner = await Banner.findByPk(id);
            if (!banner) {
                throw new Error('Banner not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(banner.createdBy));
            const updatedByUser = banner.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(banner.updatedBy))
                : null;

            // Return banner with full name information and full banner URL
            return {
                ...banner.toJSON(),
                banner: `${process.env.SERVER_URL}${banner.banner}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getBannerById service:', error);
            throw error;
        }
    }

    // Update banner
    async updateBanner(
        id: number,
        banner?: string,
        title?: boolean,
        titleText?: string | null,
        subtitle?: boolean,
        subtitleText?: string | null,
        updatedBy?: string
    ) {
        try {
            const existingBanner = await Banner.findByPk(id);
            if (!existingBanner) {
                throw new Error('Banner not found');
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

            if (banner !== undefined) updateData.banner = banner;
            if (title !== undefined) updateData.title = title;
            if (titleText !== undefined) updateData.titleText = titleText;
            if (subtitle !== undefined) updateData.subtitle = subtitle;
            if (subtitleText !== undefined) updateData.subtitleText = subtitleText;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingBanner.update(updateData);

            return existingBanner;
        } catch (error) {
            console.error('Error in updateBanner service:', error);
            throw error;
        }
    }

    // Deactivate banner (soft delete)
    async deactivateBanner(id: number, updatedBy: string) {
        try {
            const banner = await Banner.findByPk(id);
            if (!banner) {
                throw new Error('Banner not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await banner.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return banner;
        } catch (error) {
            console.error('Error in deactivateBanner service:', error);
            throw error;
        }
    }

    // Permanently delete banner
    async deleteBanner(id: number) {
        try {
            const banner = await Banner.findByPk(id);
            if (!banner) {
                throw new Error('Banner not found');
            }

            await banner.destroy();
            return { message: 'Banner permanently deleted' };
        } catch (error) {
            console.error('Error in deleteBanner service:', error);
            throw error;
        }
    }
}

const bannerService = new BannerService();
export default bannerService;
