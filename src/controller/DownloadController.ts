import { Request, Response } from 'express';
import DownloadService from '../service/DownloadService';
import UidHelper from '../utils/uidHelper';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateUniqueFileName } from '../utils/fileNameHelper';

// Max 10MB for PDFs, 5MB for images
const MAX_SIZE_PDF = 10 * 1024 * 1024;
const MAX_SIZE_IMAGE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif']);
const ALLOWED_PDF_EXTENSIONS = new Set(['.pdf']);

interface FileLike {
    name: string;
    size: number;
    mv?: Function;
    data?: Buffer;
}

interface FilesLike {
    [k: string]: FileLike;
}

// Helper function to process file based on type
const processFile = async (fileBuffer: Buffer, originalName: string, fileType: string, outputDir: string): Promise<string> => {
    const ext = path.extname(originalName).toLowerCase();
    
    if (fileType === 'image') {
        if (ext === '.gif') {
            // Keep GIF as is, don't convert
            const gifName = generateUniqueFileName(originalName);
            const gifPath = path.join(outputDir, gifName);
            fs.writeFileSync(gifPath, fileBuffer);
            return gifName;
        } else {
            // Convert JPG, PNG, JPEG to WebP
            const webpName = generateUniqueFileName(originalName).replace(/\.[^.]+$/, '.webp');
            const webpPath = path.join(outputDir, webpName);
            await sharp(fileBuffer)
                .webp({ quality: 80 })
                .toFile(webpPath);
            return webpName;
        }
    } else if (fileType === 'pdf') {
        // Keep PDF as is
        const pdfName = generateUniqueFileName(originalName);
        const pdfPath = path.join(outputDir, pdfName);
        fs.writeFileSync(pdfPath, fileBuffer);
        return pdfName;
    } else {
        throw new Error('Invalid file type');
    }
};

class DownloadController {
    // Create a new download
    static async createDownload(req: Request, res: Response): Promise<void> {
        try {
            const files = (req as any).files as FilesLike | undefined;
            if (!files || !files.file) {
                res.status(400).json({
                    success: false,
                    message: "File is required"
                });
                return;
            }

            console.log("Received files:", Object.keys(files));
            console.log("Requested body:", req.body);

            const file = files.file as FileLike;
            const { label, description, fileType } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!label || !description || !fileType) {
                res.status(400).json({
                    success: false,
                    message: "Label, description, and fileType are required fields"
                });
                return;
            }

            // Validate fileType
            if (!['image', 'pdf'].includes(fileType)) {
                res.status(400).json({
                    success: false,
                    message: "FileType must be either 'image' or 'pdf'"
                });
                return;
            }

            const ext = path.extname(file.name).toLowerCase();

            // Validate file type and size based on fileType
            if (fileType === 'image') {
                if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
                    res.status(400).json({
                        success: false,
                        message: 'For image type, only image files (jpg, jpeg, png, gif) are allowed'
                    });
                    return;
                }

                if (file.size > MAX_SIZE_IMAGE) {
                    res.status(400).json({
                        success: false,
                        message: 'Image file exceeds 5MB limit'
                    });
                    return;
                }
            } else if (fileType === 'pdf') {
                if (!ALLOWED_PDF_EXTENSIONS.has(ext)) {
                    res.status(400).json({
                        success: false,
                        message: 'For pdf type, only PDF files are allowed'
                    });
                    return;
                }

                if (file.size > MAX_SIZE_PDF) {
                    res.status(400).json({
                        success: false,
                        message: 'PDF file exceeds 10MB limit'
                    });
                    return;
                }
            }

            // Ensure upload directory exists
            const baseDir = path.join(__dirname, '..', 'uploads', 'documents');
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

            // Process file based on type
            const finalFileName = await processFile(fileBuffer, file.name, fileType, baseDir);
            
            // Store relative path for client consumption
            const storedPath = `/uploads/documents/${finalFileName}`;

            const newDownload = await DownloadService.createDownload(
                label,
                description,
                fileType,
                storedPath,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Download created successfully",
                data: newDownload
            });
        } catch (error) {
            console.error("Error in createDownload controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active downloads
    static async getAllActiveDownloads(req: Request, res: Response): Promise<void> {
        try {
            const downloads = await DownloadService.getAllActiveDownloads();
            res.status(200).json({
                success: true,
                message: "Active downloads fetched successfully",
                data: downloads
            });
        } catch (error) {
            console.error("Error in getAllActiveDownloads controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all downloads (including inactive)
    static async getAllDownloads(req: Request, res: Response): Promise<void> {
        try {
            const downloads = await DownloadService.getAllDownloads();
            res.status(200).json({
                success: true,
                message: "All downloads fetched successfully",
                data: downloads
            });
        } catch (error) {
            console.error("Error in getAllDownloads controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get download by ID
    static async getDownloadById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid download ID"
                });
                return;
            }

            const download = await DownloadService.getDownloadById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Download fetched successfully",
                data: download
            });
        } catch (error) {
            console.error("Error in getDownloadById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Download not found"
            });
        }
    }

    // Get downloads by file type
    static async getDownloadsByFileType(req: Request, res: Response): Promise<void> {
        try {
            const { fileType } = req.params;

            if (!['image', 'pdf'].includes(fileType)) {
                res.status(400).json({
                    success: false,
                    message: "FileType must be either 'image' or 'pdf'"
                });
                return;
            }

            const downloads = await DownloadService.getDownloadsByFileType(fileType);
            res.status(200).json({
                success: true,
                message: `Downloads with fileType '${fileType}' fetched successfully`,
                data: downloads
            });
        } catch (error) {
            console.error("Error in getDownloadsByFileType controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Update download
    static async updateDownload(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const files = (req as any).files as FilesLike | undefined;
            const { label, description, fileType } = req.body;
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
                    message: "Invalid download ID"
                });
                return;
            }

            // Validate fileType if provided
            if (fileType && !['image', 'pdf'].includes(fileType)) {
                res.status(400).json({
                    success: false,
                    message: "FileType must be either 'image' or 'pdf'"
                });
                return;
            }

            let fileUrl: string | undefined = undefined;

            // If a new file is uploaded, process it
            if (files && files.file) {
                const file = files.file as FileLike;
                const ext = path.extname(file.name).toLowerCase();
                const targetFileType = fileType || 'image'; // Default to image if not specified

                // Validate file type and size based on fileType
                if (targetFileType === 'image') {
                    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
                        res.status(400).json({
                            success: false,
                            message: 'For image type, only image files (jpg, jpeg, png, gif) are allowed'
                        });
                        return;
                    }

                    if (file.size > MAX_SIZE_IMAGE) {
                        res.status(400).json({
                            success: false,
                            message: 'Image file exceeds 5MB limit'
                        });
                        return;
                    }
                } else if (targetFileType === 'pdf') {
                    if (!ALLOWED_PDF_EXTENSIONS.has(ext)) {
                        res.status(400).json({
                            success: false,
                            message: 'For pdf type, only PDF files are allowed'
                        });
                        return;
                    }

                    if (file.size > MAX_SIZE_PDF) {
                        res.status(400).json({
                            success: false,
                            message: 'PDF file exceeds 10MB limit'
                        });
                        return;
                    }
                }

                // Ensure upload directory exists
                const baseDir = path.join(__dirname, '..', 'uploads', 'documents');
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

                // Process file based on type
                const finalFileName = await processFile(fileBuffer, file.name, targetFileType, baseDir);

                // Store relative path
                fileUrl = `/uploads/documents/${finalFileName}`;

                // Optional: Delete old file
                try {
                    const existingDownload = await DownloadService.getDownloadById(parseInt(id));
                    if (existingDownload && existingDownload.fileUrl) {
                        const oldFilePath = path.join(__dirname, '..', existingDownload.fileUrl.replace(process.env.SERVER_URL || '', ''));
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting old file:', error);
                    // Continue even if deletion fails
                }
            }

            const updatedDownload = await DownloadService.updateDownload(
                parseInt(id),
                label,
                description,
                fileType,
                fileUrl,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Download updated successfully",
                data: updatedDownload
            });
        } catch (error) {
            console.error("Error in updateDownload controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate download (soft delete)
    static async deactivateDownload(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid download ID"
                });
                return;
            }

            const deactivatedDownload = await DownloadService.deactivateDownload(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Download deactivated successfully",
                data: deactivatedDownload
            });
        } catch (error) {
            console.error("Error in deactivateDownload controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete download
    static async deleteDownload(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid download ID"
                });
                return;
            }

            const result = await DownloadService.deleteDownload(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteDownload controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default DownloadController;