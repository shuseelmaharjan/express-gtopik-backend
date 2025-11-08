import Gallery from '../models/Gallery';
import GalleryGroup from '../models/GalleryGroup';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';
import path from 'path';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';

class GalleryService {
    private uploadDir = path.join(__dirname, '../uploads/gallery');
    private serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    // Ensure upload directory exists
    private ensureUploadDirExists() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // Validate image file type
    private isValidImageType(mimetype: string): boolean {
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/bmp',
            'image/heic',
            'image/heif'
        ];
        return validTypes.includes(mimetype.toLowerCase());
    }

    // Process and save image (convert to JPG)
    private async processAndSaveImage(file: UploadedFile): Promise<string> {
        this.ensureUploadDirExists();

        // Generate unique filename with .jpg extension
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = path.join(this.uploadDir, uniqueFileName);

        try {
            // Convert image to JPG using sharp
            await sharp(file.data)
                .jpeg({ quality: 90 })
                .toFile(filePath);

            return uniqueFileName;
        } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Failed to process image');
        }
    }

    // Upload multiple images to a gallery group
    async uploadGalleryImages(
        files: UploadedFile | UploadedFile[],
        imageGroupId: number,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            // Validate gallery group exists and is active
            const galleryGroup = await GalleryGroup.findByPk(imageGroupId);
            if (!galleryGroup) {
                throw new Error('Gallery group not found');
            }
            if (!galleryGroup.isActive) {
                throw new Error('Gallery group is not active');
            }

            // Convert single file to array for uniform processing
            const fileArray = Array.isArray(files) ? files : [files];

            // Validate all files are images
            for (const file of fileArray) {
                if (!this.isValidImageType(file.mimetype)) {
                    throw new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed.`);
                }
            }

            // Process and save all images
            const uploadedImages = [];
            for (const file of fileArray) {
                const fileName = await this.processAndSaveImage(file);
                
                const newGalleryImage = await Gallery.create({
                    image: fileName,
                    imageGroup: imageGroupId,
                    createdBy,
                    updatedBy: null
                });

                uploadedImages.push(newGalleryImage);
            }

            // Return enhanced data with user and group information
            const enhancedImages = await Promise.all(
                uploadedImages.map(async (image) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(image.createdBy));
                    const groupData = await GalleryGroup.findByPk(image.imageGroup);

                    return {
                        ...image.toJSON(),
                        image: `${this.serverUrl}/uploads/gallery/${image.image}`,
                        createdByUser: createdByUser,
                        galleryGroup: groupData ? {
                            id: groupData.id,
                            name: groupData.name,
                            description: groupData.description
                        } : null
                    };
                })
            );

            return enhancedImages;
        } catch (error) {
            console.error('Error in uploadGalleryImages service:', error);
            throw error;
        }
    }

    // Get all gallery images (only from active groups)
    async getAllGalleryImages() {
        try {
            const galleries = await Gallery.findAll({
                include: [
                    {
                        model: GalleryGroup,
                        as: 'galleryGroup',
                        where: { isActive: true },
                        attributes: ['id', 'name', 'description']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Enhance each gallery image with creator information and full URL
            const enhancedGalleries = await Promise.all(
                galleries.map(async (gallery: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(gallery.createdBy));

                    return {
                        ...gallery.toJSON(),
                        image: `${this.serverUrl}/uploads/gallery/${gallery.image}`,
                        createdByUser: createdByUser
                    };
                })
            );

            return enhancedGalleries;
        } catch (error) {
            console.error('Error in getAllGalleryImages service:', error);
            throw error;
        }
    }

    // Get gallery images by group ID (only if group is active)
    async getGalleryImagesByGroup(groupId: number) {
        try {
            // Check if group exists and is active
            const galleryGroup = await GalleryGroup.findByPk(groupId);
            if (!galleryGroup) {
                throw new Error('Gallery group not found');
            }
            if (!galleryGroup.isActive) {
                throw new Error('Gallery group is not active');
            }

            const galleries = await Gallery.findAll({
                where: { imageGroup: groupId },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each gallery image with creator and group information
            const enhancedGalleries = await Promise.all(
                galleries.map(async (gallery: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(gallery.createdBy));

                    return {
                        ...gallery.toJSON(),
                        image: `${this.serverUrl}/uploads/gallery/${gallery.image}`,
                        createdByUser: createdByUser,
                        galleryGroup: {
                            id: galleryGroup.id,
                            name: galleryGroup.name,
                            description: galleryGroup.description
                        }
                    };
                })
            );

            return enhancedGalleries;
        } catch (error) {
            console.error('Error in getGalleryImagesByGroup service:', error);
            throw error;
        }
    }

    // Get gallery image by ID
    async getGalleryImageById(id: number) {
        try {
            const gallery = await Gallery.findByPk(id, {
                include: [
                    {
                        model: GalleryGroup,
                        as: 'galleryGroup',
                        attributes: ['id', 'name', 'description', 'isActive']
                    }
                ]
            });

            if (!gallery) {
                throw new Error('Gallery image not found');
            }

            const createdByUser = await UserHelper.getUserFullNameById(parseInt(gallery.createdBy));

            return {
                ...gallery.toJSON(),
                image: `${this.serverUrl}/uploads/gallery/${(gallery as any).image}`,
                createdByUser: createdByUser
            };
        } catch (error) {
            console.error('Error in getGalleryImageById service:', error);
            throw error;
        }
    }

    // Delete gallery image
    async deleteGalleryImage(id: number) {
        try {
            const gallery = await Gallery.findByPk(id);
            if (!gallery) {
                throw new Error('Gallery image not found');
            }

            // Delete physical file
            const filePath = path.join(this.uploadDir, gallery.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Delete database record
            await gallery.destroy();

            return { message: 'Gallery image deleted successfully' };
        } catch (error) {
            console.error('Error in deleteGalleryImage service:', error);
            throw error;
        }
    }

    // Delete multiple gallery images
    async deleteMultipleGalleryImages(ids: number[]) {
        try {
            const deletedCount = { success: 0, failed: 0 };
            const errors: string[] = [];

            for (const id of ids) {
                try {
                    await this.deleteGalleryImage(id);
                    deletedCount.success++;
                } catch (error) {
                    deletedCount.failed++;
                    errors.push(`Failed to delete image ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            return {
                message: `Deleted ${deletedCount.success} images successfully`,
                deletedCount,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            console.error('Error in deleteMultipleGalleryImages service:', error);
            throw error;
        }
    }
}

const galleryService = new GalleryService();
export default galleryService;
