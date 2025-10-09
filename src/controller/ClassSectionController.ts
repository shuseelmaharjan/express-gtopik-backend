import { Request, Response } from 'express';
import ClassSectionService from '../service/ClassSectionService';
import UidHelper from '../utils/uidHelper';

class ClassSectionController {
    // Create a new section
    static async createSection(req: Request, res: Response): Promise<void> {
        try {
            const { class_id, sectionName } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);
            
            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if (!class_id || !sectionName) {
                res.status(400).json({
                    success: false,
                    message: "class_id and sectionName are required"
                });
                return;
            }

            if (typeof sectionName !== 'string' || sectionName.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "sectionName must be a non-empty string"
                });
                return;
            }

            if (isNaN(parseInt(class_id))) {
                res.status(400).json({
                    success: false,
                    message: "class_id must be a valid number"
                });
                return;
            }

            const newSection = await ClassSectionService.createSection(
                parseInt(class_id),
                sectionName,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Section created successfully",
                data: newSection
            });
        } catch (error: any) {
            console.error("Error in createSection controller:", error);
            
            if (error.message && error.message.startsWith('Error creating section:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error creating section: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all active sections
    static async getAllActiveSections(req: Request, res: Response): Promise<void> {
        try {
            const sections = await ClassSectionService.getAllActiveSections();
            
            res.status(200).json({
                success: true,
                message: "Active sections fetched successfully",
                data: sections
            });
        } catch (error: any) {
            console.error("Error in getAllActiveSections controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching sections:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching sections: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get sections by class ID
    static async getSectionsByClassId(req: Request, res: Response): Promise<void> {
        try {
            const { class_id } = req.params;
            
            if (isNaN(parseInt(class_id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid class ID"
                });
                return;
            }

            const sections = await ClassSectionService.getSectionsByClassId(parseInt(class_id));
            
            res.status(200).json({
                success: true,
                message: "Sections fetched successfully",
                data: sections
            });
        } catch (error: any) {
            console.error("Error in getSectionsByClassId controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching sections:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching sections: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get section by ID
    static async getSectionById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid section ID"
                });
                return;
            }

            const section = await ClassSectionService.getSectionById(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: "Section fetched successfully",
                data: section
            });
        } catch (error: any) {
            console.error("Error in getSectionById controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching section:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching section: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update section name
    static async updateSectionName(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { sectionName } = req.body;
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
                    message: "Invalid section ID"
                });
                return;
            }

            if (!sectionName || typeof sectionName !== 'string' || sectionName.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "sectionName must be a non-empty string"
                });
                return;
            }

            const updatedSection = await ClassSectionService.updateSectionName(
                parseInt(id),
                sectionName,
                updatedBy
            );
            
            res.status(200).json({
                success: true,
                message: "Section name updated successfully",
                data: updatedSection
            });
        } catch (error: any) {
            console.error("Error in updateSectionName controller:", error);
            
            if (error.message && error.message.startsWith('Error updating section name:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating section name: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update section status (activate/deactivate)
    static async updateSectionStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
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
                    message: "Invalid section ID"
                });
                return;
            }

            if (typeof isActive !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: "isActive must be a boolean value"
                });
                return;
            }

            const updatedSection = await ClassSectionService.updateSectionStatus(
                parseInt(id),
                isActive,
                updatedBy
            );
            
            res.status(200).json({
                success: true,
                message: `Section ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: updatedSection
            });
        } catch (error: any) {
            console.error("Error in updateSectionStatus controller:", error);
            
            if (error.message && error.message.startsWith('Error updating section status:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating section status: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Delete section (soft delete)
    static async deleteSection(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid section ID"
                });
                return;
            }

            const result = await ClassSectionService.deleteSection(parseInt(id), updatedBy);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: "Section deleted successfully"
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Failed to delete section"
                });
            }
        } catch (error: any) {
            console.error("Error in deleteSection controller:", error);
            
            if (error.message && error.message.startsWith('Error deleting section:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error deleting section: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default ClassSectionController;