import { Request, Response } from 'express';
import GalleryGroupService from '../service/GalleryGroupService';
import UidHelper from '../utils/uidHelper';

class GalleryGroupController {
    // Create a new gallery group
    static async createGalleryGroup(req: Request, res: Response): Promise<void> {
        try {
            const { name, description } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!name) {
                res.status(400).json({
                    success: false,
                    message: "Name is a required field"
                });
                return;
            }

            const newGalleryGroup = await GalleryGroupService.createGalleryGroup(
                name,
                description || null,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Gallery group created successfully",
                data: newGalleryGroup
            });
        } catch (error) {
            console.error("Error in createGalleryGroup controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active gallery groups
    static async getAllActiveGalleryGroups(req: Request, res: Response): Promise<void> {
        try {
            const galleryGroups = await GalleryGroupService.getAllActiveGalleryGroups();
            res.status(200).json({
                success: true,
                message: "Active gallery groups fetched successfully",
                data: galleryGroups
            });
        } catch (error) {
            console.error("Error in getAllActiveGalleryGroups controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all gallery groups (including inactive)
    static async getAllGalleryGroups(req: Request, res: Response): Promise<void> {
        try {
            const galleryGroups = await GalleryGroupService.getAllGalleryGroups();
            res.status(200).json({
                success: true,
                message: "All gallery groups fetched successfully",
                data: galleryGroups
            });
        } catch (error) {
            console.error("Error in getAllGalleryGroups controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get gallery group by ID
    static async getGalleryGroupById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid gallery group ID"
                });
                return;
            }

            const galleryGroup = await GalleryGroupService.getGalleryGroupById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Gallery group fetched successfully",
                data: galleryGroup
            });
        } catch (error) {
            console.error("Error in getGalleryGroupById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Gallery group not found"
            });
        }
    }

    // Update gallery group
    static async updateGalleryGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
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
                    message: "Invalid gallery group ID"
                });
                return;
            }

            const updatedGalleryGroup = await GalleryGroupService.updateGalleryGroup(
                parseInt(id),
                name,
                description,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Gallery group updated successfully",
                data: updatedGalleryGroup
            });
        } catch (error) {
            console.error("Error in updateGalleryGroup controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate gallery group (soft delete)
    static async deactivateGalleryGroup(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid gallery group ID"
                });
                return;
            }

            const deactivatedGalleryGroup = await GalleryGroupService.deactivateGalleryGroup(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Gallery group deactivated successfully",
                data: deactivatedGalleryGroup
            });
        } catch (error) {
            console.error("Error in deactivateGalleryGroup controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete gallery group
    static async deleteGalleryGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid gallery group ID"
                });
                return;
            }

            const result = await GalleryGroupService.deleteGalleryGroup(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteGalleryGroup controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default GalleryGroupController;
