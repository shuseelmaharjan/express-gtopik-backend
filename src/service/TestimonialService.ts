import Testimonial from '../models/Testimonials';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class TestimonialService {
    // Create a new Testimonial
    async createTestimonial(
        name: string,
        position: string,
        image: string,
        message: string,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            const newTestimonial = await Testimonial.create({
                name: name.trim(),
                position: position.trim(),
                image,
                message: message.trim(),
                isActive: true,  // Always set to true by default
                createdBy,
                updatedBy: null
            });

            return newTestimonial;
        } catch (error) {
            console.error('Error in createTestimonial service:', error);
            throw error;
        }
    }

    // Get all active testimonials
    async getAllActiveTestimonials() {
        try {
            const testimonials = await Testimonial.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each testimonial with creator and updater information
            const enhancedTestimonials = await Promise.all(
                testimonials.map(async (testimonial) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(testimonial.createdBy));
                    const updatedByUser = testimonial.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(testimonial.updatedBy))
                        : null;

                    return {
                        ...testimonial.toJSON(),
                        image: `${process.env.SERVER_URL}${testimonial.image}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedTestimonials;
        } catch (error) {
            console.error('Error in getAllActiveTestimonials service:', error);
            throw error;
        }
    }

    // Get all testimonials (including inactive)
    async getAllTestimonials() {
        try {
            const testimonials = await Testimonial.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each testimonial with creator and updater information
            const enhancedTestimonials = await Promise.all(
                testimonials.map(async (testimonial) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(testimonial.createdBy));
                    const updatedByUser = testimonial.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(testimonial.updatedBy))
                        : null;

                    return {
                        ...testimonial.toJSON(),
                        image: `${process.env.SERVER_URL}${testimonial.image}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedTestimonials;
        } catch (error) {
            console.error('Error in getAllTestimonials service:', error);
            throw error;
        }
    }

    // Get testimonial by ID
    async getTestimonialById(id: number) {
        try {
            const testimonial = await Testimonial.findByPk(id);
            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(testimonial.createdBy));
            const updatedByUser = testimonial.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(testimonial.updatedBy))
                : null;

            // Return testimonial with full name information and full image URL
            return {
                ...testimonial.toJSON(),
                image: `${process.env.SERVER_URL}${testimonial.image}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getTestimonialById service:', error);
            throw error;
        }
    }

    // Update testimonial
    async updateTestimonial(
        id: number,
        name?: string,
        position?: string,
        image?: string,
        message?: string,
        updatedBy?: string
    ) {
        try {
            const existingTestimonial = await Testimonial.findByPk(id);
            if (!existingTestimonial) {
                throw new Error('Testimonial not found');
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

            if (name !== undefined) updateData.name = name.trim();
            if (position !== undefined) updateData.position = position.trim();
            if (image !== undefined) updateData.image = image;
            if (message !== undefined) updateData.message = message.trim();
            // Remove isActive handling - it stays as is
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingTestimonial.update(updateData);

            // Get creator and updater full names for return
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(existingTestimonial.createdBy));
            const updatedByUser = existingTestimonial.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(existingTestimonial.updatedBy))
                : null;

            return {
                ...existingTestimonial.toJSON(),
                image: `${process.env.SERVER_URL}${existingTestimonial.image}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in updateTestimonial service:', error);
            throw error;
        }
    }

    // Deactivate testimonial (soft delete)
    async deactivateTestimonial(id: number, updatedBy: string) {
        try {
            const testimonial = await Testimonial.findByPk(id);
            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await testimonial.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return testimonial;
        } catch (error) {
            console.error('Error in deactivateTestimonial service:', error);
            throw error;
        }
    }

    // Permanently delete testimonial
    async deleteTestimonial(id: number) {
        try {
            const testimonial = await Testimonial.findByPk(id);
            if (!testimonial) {
                throw new Error('Testimonial not found');
            }

            await testimonial.destroy();
            return { message: 'Testimonial permanently deleted' };
        } catch (error) {
            console.error('Error in deleteTestimonial service:', error);
            throw error;
        }
    }
}

const testimonialService = new TestimonialService();
export default testimonialService;
