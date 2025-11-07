import Testimonial from '../models/Testimonials';
import { Op } from 'sequelize';
import User from '../models/User';

class TestimonialService {
    // Create a new Testimonial
    async createTestimonial(
        name: string,
        position: string,
        image: string,
        message: string,
        isActive: boolean,
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
                isActive,
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
            return testimonials;
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
            return testimonials;
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
            return testimonial;
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
        isActive?: boolean,
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
            if (isActive !== undefined) updateData.isActive = isActive;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingTestimonial.update(updateData);

            return existingTestimonial;
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
