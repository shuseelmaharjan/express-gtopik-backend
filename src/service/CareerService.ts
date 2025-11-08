import Career from '../models/Career';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';
import { Op } from 'sequelize';

class CareerService {
    // Create a new Career
    async createCareer(
        title: string,
        position: string,
        description: string,
        requirements: string,
        startsFrom: Date | null,
        endsAt: Date | null,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            // Determine initial status based on start date
            const now = new Date();
            let isActive = true;
            let isPending = false;

            if (startsFrom && startsFrom > now) {
                // Future start date - should be pending
                isActive = false;
                isPending = true;
            }

            const newCareer = await Career.create({
                title,
                position,
                description,
                requirements,
                startsFrom,
                endsAt,
                isActive,
                isPending,
                createdBy,
                updatedBy: null
            });

            return newCareer;
        } catch (error) {
            console.error('Error in createCareer service:', error);
            throw error;
        }
    }

    // Get all active careers
    async getAllActiveCareers() {
        try {
            const careers = await Career.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each career with creator and updater information
            const enhancedCareers = await Promise.all(
                careers.map(async (career: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(career.createdBy));
                    const updatedByUser = career.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(career.updatedBy))
                        : null;

                    return {
                        ...career.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedCareers;
        } catch (error) {
            console.error('Error in getAllActiveCareers service:', error);
            throw error;
        }
    }

    // Get all careers (including inactive)
    async getAllCareers() {
        try {
            const careers = await Career.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each career with creator and updater information
            const enhancedCareers = await Promise.all(
                careers.map(async (career: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(career.createdBy));
                    const updatedByUser = career.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(career.updatedBy))
                        : null;

                    return {
                        ...career.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedCareers;
        } catch (error) {
            console.error('Error in getAllCareers service:', error);
            throw error;
        }
    }

    // Get pending careers
    async getPendingCareers() {
        try {
            const careers = await Career.findAll({
                where: {
                    isPending: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each career with creator and updater information
            const enhancedCareers = await Promise.all(
                careers.map(async (career: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(career.createdBy));
                    const updatedByUser = career.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(career.updatedBy))
                        : null;

                    return {
                        ...career.toJSON(),
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedCareers;
        } catch (error) {
            console.error('Error in getPendingCareers service:', error);
            throw error;
        }
    }

    // Get career by ID
    async getCareerById(id: number) {
        try {
            const career = await Career.findByPk(id);
            if (!career) {
                throw new Error('Career not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(career.createdBy));
            const updatedByUser = career.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(career.updatedBy))
                : null;

            // Return career with full name information
            return {
                ...career.toJSON(),
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getCareerById service:', error);
            throw error;
        }
    }

    // Update career
    async updateCareer(
        id: number,
        title?: string,
        position?: string,
        description?: string,
        requirements?: string,
        startsFrom?: Date | null,
        endsAt?: Date | null,
        updatedBy?: string
    ) {
        try {
            const existingCareer = await Career.findByPk(id);
            if (!existingCareer) {
                throw new Error('Career not found');
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

            if (title !== undefined) updateData.title = title;
            if (position !== undefined) updateData.position = position;
            if (description !== undefined) updateData.description = description;
            if (requirements !== undefined) updateData.requirements = requirements;
            if (startsFrom !== undefined) updateData.startsFrom = startsFrom;
            if (endsAt !== undefined) updateData.endsAt = endsAt;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            // Recalculate status if dates are being updated
            if (startsFrom !== undefined || endsAt !== undefined) {
                const now = new Date();
                const newStartsFrom = startsFrom !== undefined ? startsFrom : existingCareer.startsFrom;
                const newEndsAt = endsAt !== undefined ? endsAt : existingCareer.endsAt;

                if (newStartsFrom && newStartsFrom > now) {
                    // Future start date - should be pending
                    updateData.isActive = false;
                    updateData.isPending = true;
                } else if (newEndsAt && newEndsAt < now) {
                    // Past end date - should be inactive
                    updateData.isActive = false;
                    updateData.isPending = false;
                } else {
                    // Active period
                    updateData.isActive = true;
                    updateData.isPending = false;
                }
            }

            await existingCareer.update(updateData);

            // Return updated career with user information
            return await this.getCareerById(id);
        } catch (error) {
            console.error('Error in updateCareer service:', error);
            throw error;
        }
    }

    // Deactivate career (soft delete)
    async deactivateCareer(id: number, updatedBy: string) {
        try {
            const career = await Career.findByPk(id);
            if (!career) {
                throw new Error('Career not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await career.update({
                isActive: false,
                isPending: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return career;
        } catch (error) {
            console.error('Error in deactivateCareer service:', error);
            throw error;
        }
    }

    // Permanently delete career
    async deleteCareer(id: number) {
        try {
            const career = await Career.findByPk(id);
            if (!career) {
                throw new Error('Career not found');
            }

            await career.destroy();
            return { message: 'Career permanently deleted' };
        } catch (error) {
            console.error('Error in deleteCareer service:', error);
            throw error;
        }
    }

    // Update career statuses based on dates (for cronjob)
    async updateCareerStatuses() {
        try {
            const now = new Date();
            
            console.log('========== Career Status Update Debug ==========');
            console.log('Current server time:', now);
            console.log('Current server time (ISO):', now.toISOString());
            console.log('Current server time (Local):', now.toLocaleString('en-US', { timeZone: process.env.TIMEZONE || 'UTC' }));
            
            // First, let's check all careers and their dates
            const allCareers = await Career.findAll({
                attributes: ['id', 'title', 'position', 'startsFrom', 'endsAt', 'isActive', 'isPending']
            });
            
            console.log('\n--- Current Careers in Database ---');
            allCareers.forEach(career => {
                console.log(`ID: ${career.id}, Title: ${career.title}, Position: ${career.position}`);
                console.log(`  StartFrom: ${career.startsFrom}, EndAt: ${career.endsAt}`);
                console.log(`  isActive: ${career.isActive}, isPending: ${career.isPending}`);
                if (career.startsFrom) {
                    console.log(`  StartFrom <= Now? ${career.startsFrom <= now}`);
                }
                if (career.endsAt) {
                    console.log(`  EndAt < Now? ${career.endsAt < now}`);
                }
            });
            
            // Update careers that should become active (start date has passed)
            const activatedCareers = await Career.update(
                {
                    isActive: true,
                    isPending: false,
                    updatedAt: now
                },
                {
                    where: {
                        startsFrom: {
                            [Op.lte]: now
                        },
                        isPending: true,
                        [Op.or]: [
                            { endsAt: null },
                            { endsAt: { [Op.gt]: now } }
                        ]
                    }
                }
            );

            // Update careers that should become inactive (end date has passed)
            const deactivatedCareers = await Career.update(
                {
                    isActive: false,
                    isPending: false,
                    updatedAt: now
                },
                {
                    where: {
                        endsAt: {
                            [Op.lt]: now
                        },
                        isActive: true
                    }
                }
            );

            console.log(`\n--- Update Results ---`);
            console.log(`Activated: ${activatedCareers[0]} careers`);
            console.log(`Deactivated: ${deactivatedCareers[0]} careers`);
            console.log('================================================\n');
            
            return { 
                message: 'Career statuses updated successfully',
                activated: activatedCareers[0],
                deactivated: deactivatedCareers[0]
            };
        } catch (error) {
            console.error('Error in updateCareerStatuses service:', error);
            throw error;
        }
    }
}

const careerService = new CareerService();
export default careerService;