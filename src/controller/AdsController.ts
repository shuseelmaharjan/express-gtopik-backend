import { Request, Response } from 'express';
import AdsService from '../service/AdsService';
import UidHelper from '../utils/uidHelper';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateUniqueFileName } from '../utils/fileNameHelper';

// Max 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif']);

// Helper function to process image based on type
const processImage = async (fileBuffer: Buffer, originalName: string, outputPath: string): Promise<string> => {
    const ext = path.extname(originalName).toLowerCase();
    
    if (ext === '.gif') {
        // Keep GIF as is, don't convert
        const gifName = generateUniqueFileName(originalName);
        const gifPath = outputPath.replace(path.basename(outputPath), gifName);
        fs.writeFileSync(gifPath, fileBuffer);
        return path.basename(gifPath);
    } else {
        // Convert JPG, PNG, JPEG to WebP
        const webpName = generateUniqueFileName(originalName).replace(/\.[^.]+$/, '.webp');
        const webpPath = outputPath.replace(path.basename(outputPath), webpName);
        await sharp(fileBuffer)
            .webp({ quality: 80 })
            .toFile(webpPath);
        return path.basename(webpPath);
    }
};

interface FileLike {
    name: string;
    size: number;
    mv?: Function;
    data?: Buffer;
}

interface FilesLike {
    [k: string]: FileLike;
}

class AdsController {
    // Create a new ad
    static async createAd(req: Request, res: Response): Promise<void> {
        try {
            const files = (req as any).files as FilesLike | undefined;
            if (!files || !files.image) {
                res.status(400).json({
                    success: false,
                    message: "Ad image file is required"
                });
                return;
            }

            console.log("Received files:", Object.keys(files));
            console.log("Requested body:", req.body);

            const file = files.image as FileLike;
            const { title, subtitle, link } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!title || !subtitle || !link) {
                res.status(400).json({
                    success: false,
                    message: "Title, subtitle, and link are required fields"
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
                    message: 'Only image files (jpg, jpeg, png, gif) are allowed'
                });
                return;
            }

            // Ensure upload directory exists
            const baseDir = path.join(__dirname, '..', 'uploads', 'ads');
            fs.mkdirSync(baseDir, { recursive: true });

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

            // Process image based on type (convert to WebP or keep GIF)
            const tempOutputPath = path.join(baseDir, 'temp_output');
            const finalFileName = await processImage(fileBuffer, file.name, tempOutputPath);
            
            // Store relative path for client consumption
            const storedPath = `/uploads/ads/${finalFileName}`;

            const newAd = await AdsService.createAd(
                storedPath,
                title,
                subtitle,
                link,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Ad created successfully",
                data: newAd
            });
        } catch (error) {
            console.error("Error in createAd controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active ads
    static async getAllActiveAds(req: Request, res: Response): Promise<void> {
        try {
            const ads = await AdsService.getAllActiveAds();
            res.status(200).json({
                success: true,
                message: "Active ads fetched successfully",
                data: ads
            });
        } catch (error) {
            console.error("Error in getAllActiveAds controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all ads (including inactive)
    static async getAllAds(req: Request, res: Response): Promise<void> {
        try {
            const ads = await AdsService.getAllAds();
            res.status(200).json({
                success: true,
                message: "All ads fetched successfully",
                data: ads
            });
        } catch (error) {
            console.error("Error in getAllAds controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get ad by ID
    static async getAdById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid ad ID"
                });
                return;
            }

            const ad = await AdsService.getAdById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Ad fetched successfully",
                data: ad
            });
        } catch (error) {
            console.error("Error in getAdById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Ad not found"
            });
        }
    }

    // Update ad
    static async updateAd(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const files = (req as any).files as FilesLike | undefined;
            const { title, subtitle, link } = req.body;
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
                    message: "Invalid ad ID"
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
                        message: 'Only image files (jpg, jpeg, png, gif) are allowed'
                    });
                    return;
                }

                // Ensure upload directory exists
                const baseDir = path.join(__dirname, '..', 'uploads', 'ads');
                fs.mkdirSync(baseDir, { recursive: true });

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

                // Process image based on type (convert to WebP or keep GIF)
                const tempOutputPath = path.join(baseDir, 'temp_output');
                const finalFileName = await processImage(fileBuffer, file.name, tempOutputPath);

                // Store relative path
                imagePath = `/uploads/ads/${finalFileName}`;

                // Optional: Delete old ad image file
                try {
                    const existingAd = await AdsService.getAdById(parseInt(id));
                    if (existingAd && existingAd.image) {
                        const oldFilePath = path.join(__dirname, '..', existingAd.image.replace(process.env.SERVER_URL || '', ''));
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting old ad image file:', error);
                    // Continue even if deletion fails
                }
            }

            const updatedAd = await AdsService.updateAd(
                parseInt(id),
                imagePath,
                title,
                subtitle,
                link,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Ad updated successfully",
                data: updatedAd
            });
        } catch (error) {
            console.error("Error in updateAd controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate ad (soft delete)
    static async deactivateAd(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid ad ID"
                });
                return;
            }

            const deactivatedAd = await AdsService.deactivateAd(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Ad deactivated successfully",
                data: deactivatedAd
            });
        } catch (error) {
            console.error("Error in deactivateAd controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete ad
    static async deleteAd(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid ad ID"
                });
                return;
            }

            const result = await AdsService.deleteAd(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteAd controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default AdsController;