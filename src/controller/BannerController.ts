import { Request, Response } from 'express';
import BannerService from '../service/BannerService';
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

class BannerController {
    // Create a new banner
    static async createBanner(req: Request, res: Response): Promise<void> {
        try {
            const files = (req as any).files as FilesLike | undefined;
            if (!files || !files.banner) {
                res.status(400).json({
                    success: false,
                    message: "Banner image file is required"
                });
                return;
            }

            console.log("Received files:", Object.keys(files));
            console.log("Requested body:", req.body);

            const file = files.banner as FileLike;
            const { title, titleText, subtitle, subtitleText } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Parse boolean values from strings (multipart/form-data sends everything as strings)
            const titleBool = title === 'true' || title === true;
            const subtitleBool = subtitle === 'true' || subtitle === true;

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
            const baseDir = path.join(__dirname, '..', 'uploads', 'banner');
            fs.mkdirSync(baseDir, { recursive: true });

            // Generate unique filename with .webp extension
            const uniqueName = generateUniqueFileName(file.name).replace(/\.[^.]+$/, '.webp');
            const finalPath = path.join(baseDir, uniqueName);

            // Get file buffer
            let fileBuffer: Buffer;
            if (file.data) {
                fileBuffer = file.data;
            } else if (typeof file.mv === 'function') {
                // If using express-fileupload with tempFiles, read the temp file
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
            const storedPath = `/uploads/banner/${uniqueName}`;

            const newBanner = await BannerService.createBanner(
                storedPath,
                titleBool,
                titleText || null,
                subtitleBool,
                subtitleText || null,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Banner created successfully",
                data: newBanner
            });
        } catch (error) {
            console.error("Error in createBanner controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active banners
    static async getAllActiveBanners(req: Request, res: Response): Promise<void> {
        try {
            const banners = await BannerService.getAllActiveBanners();
            res.status(200).json({
                success: true,
                message: "Active banners fetched successfully",
                data: banners
            });
        } catch (error) {
            console.error("Error in getAllActiveBanners controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all banners (including inactive)
    static async getAllBanners(req: Request, res: Response): Promise<void> {
        try {
            const banners = await BannerService.getAllBanners();
            res.status(200).json({
                success: true,
                message: "All banners fetched successfully",
                data: banners
            });
        } catch (error) {
            console.error("Error in getAllBanners controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get banner by ID
    static async getBannerById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid banner ID"
                });
                return;
            }

            const banner = await BannerService.getBannerById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Banner fetched successfully",
                data: banner
            });
        } catch (error) {
            console.error("Error in getBannerById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Banner not found"
            });
        }
    }

    // Update banner
    static async updateBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const files = (req as any).files as FilesLike | undefined;
            const { title, titleText, subtitle, subtitleText } = req.body;
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
                    message: "Invalid banner ID"
                });
                return;
            }

            // Parse boolean values from strings if they exist (multipart/form-data sends everything as strings)
            const titleBool = title !== undefined ? (title === 'true' || title === true) : undefined;
            const subtitleBool = subtitle !== undefined ? (subtitle === 'true' || subtitle === true) : undefined;

            let bannerPath: string | undefined = undefined;

            // If a new file is uploaded, process it
            if (files && files.banner) {
                const file = files.banner as FileLike;

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
                const baseDir = path.join(__dirname, '..', 'uploads', 'banner');
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
                bannerPath = `/uploads/banner/${uniqueName}`;

                // Optional: Delete old banner file
                try {
                    const existingBanner = await BannerService.getBannerById(parseInt(id));
                    if (existingBanner && existingBanner.banner) {
                        const oldFilePath = path.join(__dirname, '..', existingBanner.banner);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting old banner file:', error);
                    // Continue even if deletion fails
                }
            }

            const updatedBanner = await BannerService.updateBanner(
                parseInt(id),
                bannerPath,
                titleBool,
                titleText,
                subtitleBool,
                subtitleText,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Banner updated successfully",
                data: updatedBanner
            });
        } catch (error) {
            console.error("Error in updateBanner controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate banner (soft delete)
    static async deactivateBanner(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid banner ID"
                });
                return;
            }

            const deactivatedBanner = await BannerService.deactivateBanner(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Banner deactivated successfully",
                data: deactivatedBanner
            });
        } catch (error) {
            console.error("Error in deactivateBanner controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete banner
    static async deleteBanner(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid banner ID"
                });
                return;
            }

            const result = await BannerService.deleteBanner(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteBanner controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default BannerController;
