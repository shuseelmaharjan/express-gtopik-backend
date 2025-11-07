import { Request, Response } from 'express';
import PrincipalMessageService from '../service/PrincipalMessageService';
import UidHelper from '../utils/uidHelper';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateUniqueFileName } from '../utils/fileNameHelper';

// Max 5MB
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

interface FileLike {
    name: string;
    size: number;
    mv?: Function;
    data?: Buffer;
}

interface FilesLike {
    [k: string]: FileLike;
}

class PrincipalMessageController {
    // Create a new principal message
    static async createPrincipalMessage(req: Request, res: Response): Promise<void> {
        try {
            const files = (req as any).files as FilesLike | undefined;
            if (!files || !files.profilePicture) {
                res.status(400).json({
                    success: false,
                    message: "Profile picture file is required"
                });
                return;
            }

            const file = files.profilePicture as FileLike;
            const { principalName, message } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!principalName || typeof principalName !== 'string' || principalName.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Principal name is required and must be a non-empty string"
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
                    message: 'Only image files (jpg, jpeg, png) are allowed'
                });
                return;
            }

            // Ensure upload directory exists
            const baseDir = path.join(__dirname, '..', 'uploads', 'profile');
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
            const storedPath = `/uploads/profile/${uniqueName}`;

            const newPrincipalMessage = await PrincipalMessageService.createPrincipalMessage(
                principalName,
                message,
                storedPath,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Principal message created successfully",
                data: newPrincipalMessage
            });
        } catch (error) {
            console.error("Error in createPrincipalMessage controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get the principal message
    static async getPrincipalMessage(req: Request, res: Response): Promise<void> {
        try {
            const principalMessage = await PrincipalMessageService.getPrincipalMessage();
            
            if (!principalMessage) {
                // No record found, but still return success: true with data: null
                res.status(200).json({
                    success: true,
                    message: "No principal message found",
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Principal message fetched successfully",
                data: principalMessage
            });
        } catch (error) {
            console.error("Error in getPrincipalMessage controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update principal message
    static async updatePrincipalMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const files = (req as any).files as FilesLike | undefined;
            const { principalName, message } = req.body;
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
                    message: "Invalid principal message ID"
                });
                return;
            }

            let profilePicturePath: string | undefined = undefined;

            // If a new file is uploaded, process it
            if (files && files.profilePicture) {
                const file = files.profilePicture as FileLike;

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
                        message: 'Only image files (jpg, jpeg, png) are allowed'
                    });
                    return;
                }

                // Ensure upload directory exists
                const baseDir = path.join(__dirname, '..', 'uploads', 'profile');
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
                profilePicturePath = `/uploads/profile/${uniqueName}`;

                // Optional: Delete old image file
                try {
                    const existingPrincipalMessage = await PrincipalMessageService.getPrincipalMessage();
                    if (existingPrincipalMessage && existingPrincipalMessage.profilePicture) {
                        // Extract the path part without SERVER_URL
                        const oldPath = existingPrincipalMessage.profilePicture.replace(process.env.SERVER_URL || '', '');
                        const oldFilePath = path.join(__dirname, '..', oldPath);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting old image file:', error);
                    // Continue even if deletion fails
                }
            }

            const updatedPrincipalMessage = await PrincipalMessageService.updatePrincipalMessage(
                parseInt(id),
                principalName,
                message,
                profilePicturePath,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Principal message updated successfully",
                data: updatedPrincipalMessage
            });
        } catch (error) {
            console.error("Error in updatePrincipalMessage controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Hard delete principal message
    static async deletePrincipalMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid principal message ID"
                });
                return;
            }

            // Optional: Delete image file before deleting principal message
            try {
                const existingPrincipalMessage = await PrincipalMessageService.getPrincipalMessage();
                if (existingPrincipalMessage && existingPrincipalMessage.profilePicture) {
                    // Extract the path part without SERVER_URL
                    const oldPath = existingPrincipalMessage.profilePicture.replace(process.env.SERVER_URL || '', '');
                    const oldFilePath = path.join(__dirname, '..', oldPath);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
                // Continue even if deletion fails
            }

            const result = await PrincipalMessageService.deletePrincipalMessage(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deletePrincipalMessage controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default PrincipalMessageController;