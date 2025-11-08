import { Request, Response } from 'express';
import GalleryService from '../service/GalleryService';
import UidHelper from '../utils/uidHelper';
import { UploadedFile } from 'express-fileupload';

class GalleryController {
    // Upload gallery images (multiple files support)
    static async uploadGalleryImages(req: Request, res: Response): Promise<void> {
        try {
            const { imageGroupId } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate imageGroupId
            if (!imageGroupId || isNaN(parseInt(imageGroupId))) {
                res.status(400).json({
                    success: false,
                    message: "Valid imageGroupId is required"
                });
                return;
            }

            // Check if files are uploaded
            if (!req.files || Object.keys(req.files).length === 0) {
                res.status(400).json({
                    success: false,
                    message: "No files were uploaded"
                });
                return;
            }

            // Get the uploaded files (support multiple files)
            const files = req.files.images as UploadedFile | UploadedFile[];
            
            if (!files) {
                res.status(400).json({
                    success: false,
                    message: "No images field found in the upload"
                });
                return;
            }

            const uploadedImages = await GalleryService.uploadGalleryImages(
                files,
                parseInt(imageGroupId),
                createdBy
            );

            res.status(201).json({
                success: true,
                message: `${Array.isArray(uploadedImages) ? uploadedImages.length : 1} image(s) uploaded successfully`,
                data: uploadedImages
            });
        } catch (error) {
            console.error("Error in uploadGalleryImages controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all gallery images (only from active groups)
    static async getAllGalleryImages(req: Request, res: Response): Promise<void> {
        try {
            const galleries = await GalleryService.getAllGalleryImages();
            res.status(200).json({
                success: true,
                message: "Gallery images fetched successfully",
                data: galleries
            });
        } catch (error) {
            console.error("Error in getAllGalleryImages controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get gallery images by group ID
    static async getGalleryImagesByGroup(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;

            if (isNaN(parseInt(groupId))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid group ID"
                });
                return;
            }

            const galleries = await GalleryService.getGalleryImagesByGroup(parseInt(groupId));
            res.status(200).json({
                success: true,
                message: "Gallery images fetched successfully",
                data: galleries
            });
        } catch (error) {
            console.error("Error in getGalleryImagesByGroup controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Gallery group not found"
            });
        }
    }

    // Get gallery image by ID
    static async getGalleryImageById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid image ID"
                });
                return;
            }

            const gallery = await GalleryService.getGalleryImageById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Gallery image fetched successfully",
                data: gallery
            });
        } catch (error) {
            console.error("Error in getGalleryImageById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Gallery image not found"
            });
        }
    }

    // Delete gallery image
    static async deleteGalleryImage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid image ID"
                });
                return;
            }

            const result = await GalleryService.deleteGalleryImage(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteGalleryImage controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Delete multiple gallery images
    static async deleteMultipleGalleryImages(req: Request, res: Response): Promise<void> {
        try {
            const { ids } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Array of image IDs is required"
                });
                return;
            }

            // Validate all IDs are numbers
            const validIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
            
            if (validIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "No valid image IDs provided"
                });
                return;
            }

            const result = await GalleryService.deleteMultipleGalleryImages(validIds);
            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    deletedCount: result.deletedCount,
                    errors: result.errors
                }
            });
        } catch (error) {
            console.error("Error in deleteMultipleGalleryImages controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default GalleryController;
