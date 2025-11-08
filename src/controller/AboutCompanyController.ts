import { Request, Response } from 'express';
import AboutCompanyService from '../service/AboutCompanyService';
import UidHelper from '../utils/uidHelper';

class AboutCompanyController {
    // Create a new about company record
    static async createAboutCompany(req: Request, res: Response): Promise<void> {
        try {
            const { description, mission, vision } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!description || !mission || !vision) {
                res.status(400).json({
                    success: false,
                    message: "Description, mission, and vision are required fields"
                });
                return;
            }

            const newAboutCompany = await AboutCompanyService.createAboutCompany(
                description,
                mission,
                vision,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "About Company record created successfully",
                data: newAboutCompany
            });
        } catch (error) {
            console.error("Error in createAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active about company records
    static async getAllActiveAboutCompany(req: Request, res: Response): Promise<void> {
        try {
            const aboutCompanyRecords = await AboutCompanyService.getAllActiveAboutCompany();
            res.status(200).json({
                success: true,
                message: "Active About Company records fetched successfully",
                data: aboutCompanyRecords
            });
        } catch (error) {
            console.error("Error in getAllActiveAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all about company records (including inactive)
    static async getAllAboutCompany(req: Request, res: Response): Promise<void> {
        try {
            const aboutCompanyRecords = await AboutCompanyService.getAllAboutCompany();
            res.status(200).json({
                success: true,
                message: "All About Company records fetched successfully",
                data: aboutCompanyRecords
            });
        } catch (error) {
            console.error("Error in getAllAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get about company by ID
    static async getAboutCompanyById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid About Company ID"
                });
                return;
            }

            const aboutCompany = await AboutCompanyService.getAboutCompanyById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "About Company record fetched successfully",
                data: aboutCompany
            });
        } catch (error) {
            console.error("Error in getAboutCompanyById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "About Company record not found"
            });
        }
    }

    // Update about company
    static async updateAboutCompany(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { description, mission, vision } = req.body;
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
                    message: "Invalid About Company ID"
                });
                return;
            }

            const updatedAboutCompany = await AboutCompanyService.updateAboutCompany(
                parseInt(id),
                description,
                mission,
                vision,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "About Company record updated successfully",
                data: updatedAboutCompany
            });
        } catch (error) {
            console.error("Error in updateAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate about company (soft delete)
    static async deactivateAboutCompany(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid About Company ID"
                });
                return;
            }

            const deactivatedAboutCompany = await AboutCompanyService.deactivateAboutCompany(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "About Company record deactivated successfully",
                data: deactivatedAboutCompany
            });
        } catch (error) {
            console.error("Error in deactivateAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete about company
    static async deleteAboutCompany(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid About Company ID"
                });
                return;
            }

            const result = await AboutCompanyService.deleteAboutCompany(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteAboutCompany controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default AboutCompanyController;