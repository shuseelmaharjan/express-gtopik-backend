import { Request, Response } from 'express';
import TestimonialService from '../service/TestimonialService';
import UidHelper from '../utils/uidHelper';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateUniqueFileName } from '../utils/fileNameHelper';

// Max 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']);

interface FileLike {
    name: string;
    size: number;
    mv?: Function;
    data?: Buffer;
}

interface FilesLike {
    [k: string]: FileLike;
}

class TestimonialController {
    // Create a new testimonial
    static async createTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const files = (req as any).files as FilesLike | undefined;
            if (!files || !files.image) {
                res.status(400).json({
                    success: false,
                    message: "Image file is required"
                });
                return;
            }

            const file = files.image as FileLike;
            const { name, position, message, isActive } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Parse boolean value from string (multipart/form-data sends everything as strings)
            const isActiveBool = isActive === 'true' || isActive === true;

            // Validate required fields
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Name is required and must be a non-empty string"
                });
                return;
            }

            if (!position || typeof position !== 'string' || position.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Position is required and must be a non-empty string"
                });
                return;
            }

            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Message is required and must be a non-empty string"
                });
                return;
            }

            // Validate file size
            if (file.size > MAX_SIZE) {
                res.status(400).json({
                    success: false,
                    message: 'File exceeds 5MB limit'
                });
                return;
            }

            // Validate file extension
            const ext = path.extname(file.name).toLowerCase();
            if (!ALLOWED_EXTENSIONS.has(ext)) {
                res.status(400).json({
                    success: false,
                    message: 'Only image files (jpg, jpeg, png, gif, bmp, tiff) are allowed'
                });
                return;
            }

            // Ensure upload directory exists
            const baseDir = path.join(__dirname, '..', 'uploads', 'testimonials');
            fs.mkdirSync(baseDir, { recursive: true });

            // Generate unique filename with .webp extension
            const uniqueName = generateUniqueFileName(file.name).replace(/\.[^.]+$/, '.webp');
            const finalPath = path.join(baseDir, uniqueName);

            // Get file buffer
            let fileBuffer: Buffer;
            if (file.data) {
                fileBuffer = file.data;
            } else if (typeof file.mv === 'function') {
                const tempPath = path.join(baseDir, `temp_${Date.now()}`);
                await new Promise<void>((resolve, reject) => {
                    file.mv!(tempPath, (err: any) => err ? reject(err) : resolve());
                });
                fileBuffer = fs.readFileSync(tempPath);
                fs.unlinkSync(tempPath); // Clean up temp file
            } else {
                res.status(500).json({
                    success: false,
                    message: 'File data handler missing'
                });
                return;
            }

            // Convert image to WebP format using sharp
            await sharp(fileBuffer)
                .webp({ quality: 80 })
                .toFile(finalPath);

            // Store relative path for client consumption
            const storedPath = `/uploads/testimonials/${uniqueName}`;

            const newTestimonial = await TestimonialService.createTestimonial(
                name,
                position,
                storedPath,
                message,
                isActive,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Testimonial created successfully",
                data: newTestimonial
            });
        } catch (error) {
            console.error("Error in createTestimonial controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active testimonials
    static async getAllActiveTestimonials(req: Request, res: Response): Promise<void> {
        try {
            const testimonials = await TestimonialService.getAllActiveTestimonials();
            res.status(200).json({
                success: true,
                message: "Active testimonials fetched successfully",
                data: testimonials
            });
        } catch (error) {
            console.error("Error in getAllActiveTestimonials controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all testimonials (including inactive)
    static async getAllTestimonials(req: Request, res: Response): Promise<void> {
        try {
            const testimonials = await TestimonialService.getAllTestimonials();
            res.status(200).json({
                success: true,
                message: "All testimonials fetched successfully",
                data: testimonials
            });
        } catch (error) {
            console.error("Error in getAllTestimonials controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get testimonial by ID
    static async getTestimonialById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid testimonial ID"
                });
                return;
            }

            const testimonial = await TestimonialService.getTestimonialById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Testimonial fetched successfully",
                data: testimonial
            });
        } catch (error) {
            console.error("Error in getTestimonialById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Testimonial not found"
            });
        }
    }

    // Update testimonial
    static async updateTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const files = (req as any).files as FilesLike | undefined;
            const { name, position, message, isActive } = req.body;
            const updatedBy = UidHelper.getUserId(req.headers);

            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid testimonial ID"
                });
                return;
            }

            let imagePath: string | undefined = undefined;

            // If a new file is uploaded, process it
            if (files && files.image) {
                const file = files.image as FileLike;

                // Validate file size
                if (file.size > MAX_SIZE) {
                    res.status(400).json({
                        success: false,
                        message: 'File exceeds 5MB limit'
                    });
                    return;
                }

                // Validate file extension
                const ext = path.extname(file.name).toLowerCase();
                if (!ALLOWED_EXTENSIONS.has(ext)) {
                    res.status(400).json({
                        success: false,
                        message: 'Only image files (jpg, jpeg, png, gif, bmp, tiff) are allowed'
                    });
                    return;
                }

                // Ensure upload directory exists
                const baseDir = path.join(__dirname, '..', 'uploads', 'testimonials');
                fs.mkdirSync(baseDir, { recursive: true });

                // Generate unique filename with .webp extension
                const uniqueName = generateUniqueFileName(file.name).replace(/\.[^.]+$/, '.webp');
                const finalPath = path.join(baseDir, uniqueName);

                // Get file buffer
                let fileBuffer: Buffer;
                if (file.data) {
                    fileBuffer = file.data;
                } else if (typeof file.mv === 'function') {
                    const tempPath = path.join(baseDir, `temp_${Date.now()}`);
                    await new Promise<void>((resolve, reject) => {
                        file.mv!(tempPath, (err: any) => err ? reject(err) : resolve());
                    });
                    fileBuffer = fs.readFileSync(tempPath);
                    fs.unlinkSync(tempPath); // Clean up temp file
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'File data handler missing'
                    });
                    return;
                }

                // Convert image to WebP format using sharp
                await sharp(fileBuffer)
                    .webp({ quality: 80 })
                    .toFile(finalPath);

                // Store relative path
                imagePath = `/uploads/testimonials/${uniqueName}`;

                // Optional: Delete old image file
                try {
                    const existingTestimonial = await TestimonialService.getTestimonialById(parseInt(id));
                    if (existingTestimonial && existingTestimonial.image) {
                        const oldFilePath = path.join(__dirname, '..', existingTestimonial.image);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting old image file:', error);
                    // Continue even if deletion fails
                }
            }

            const updatedTestimonial = await TestimonialService.updateTestimonial(
                parseInt(id),
                name,
                position,
                imagePath,
                message,
                isActive,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Testimonial updated successfully",
                data: updatedTestimonial
            });
        } catch (error) {
            console.error("Error in updateTestimonial controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate testimonial (soft delete)
    static async deactivateTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updatedBy = UidHelper.getUserId(req.headers);

            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid testimonial ID"
                });
                return;
            }

            const deactivatedTestimonial = await TestimonialService.deactivateTestimonial(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Testimonial deactivated successfully",
                data: deactivatedTestimonial
            });
        } catch (error) {
            console.error("Error in deactivateTestimonial controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete testimonial
    static async deleteTestimonial(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid testimonial ID"
                });
                return;
            }

            // Optional: Delete image file before deleting testimonial
            try {
                const existingTestimonial = await TestimonialService.getTestimonialById(parseInt(id));
                if (existingTestimonial && existingTestimonial.image) {
                    const oldFilePath = path.join(__dirname, '..', existingTestimonial.image);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
                // Continue even if deletion fails
            }

            const result = await TestimonialService.deleteTestimonial(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteTestimonial controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default TestimonialController;
