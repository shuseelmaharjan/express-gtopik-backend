import { Request, Response } from 'express';
import CareerService from '../service/CareerService';
import UidHelper from '../utils/uidHelper';

class CareerController {
    // Create a new career
    static async createCareer(req: Request, res: Response): Promise<void> {
        try {
            const { title, position, description, requirements, startsFrom, endsAt } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);

            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!title || !position || !description || !requirements) {
                res.status(400).json({
                    success: false,
                    message: "Title, position, description, and requirements are required fields"
                });
                return;
            }

            // Parse dates if provided
            let parsedStartsFrom: Date | null = null;
            let parsedEndsAt: Date | null = null;

            if (startsFrom) {
                parsedStartsFrom = new Date(startsFrom);
                if (isNaN(parsedStartsFrom.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid startsFrom date format"
                    });
                    return;
                }
            }

            if (endsAt) {
                parsedEndsAt = new Date(endsAt);
                if (isNaN(parsedEndsAt.getTime())) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid endsAt date format"
                    });
                    return;
                }
            }

            // Validate date logic
            if (parsedStartsFrom && parsedEndsAt && parsedStartsFrom >= parsedEndsAt) {
                res.status(400).json({
                    success: false,
                    message: "Start date must be before end date"
                });
                return;
            }

            const newCareer = await CareerService.createCareer(
                title,
                position,
                description,
                requirements,
                parsedStartsFrom,
                parsedEndsAt,
                createdBy
            );

            res.status(201).json({
                success: true,
                message: "Career created successfully",
                data: newCareer
            });
        } catch (error) {
            console.error("Error in createCareer controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Get all active careers
    static async getAllActiveCareers(req: Request, res: Response): Promise<void> {
        try {
            const careers = await CareerService.getAllActiveCareers();
            res.status(200).json({
                success: true,
                message: "Active careers fetched successfully",
                data: careers
            });
        } catch (error) {
            console.error("Error in getAllActiveCareers controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all careers (including inactive)
    static async getAllCareers(req: Request, res: Response): Promise<void> {
        try {
            const careers = await CareerService.getAllCareers();
            res.status(200).json({
                success: true,
                message: "All careers fetched successfully",
                data: careers
            });
        } catch (error) {
            console.error("Error in getAllCareers controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get pending careers
    static async getPendingCareers(req: Request, res: Response): Promise<void> {
        try {
            const careers = await CareerService.getPendingCareers();
            res.status(200).json({
                success: true,
                message: "Pending careers fetched successfully",
                data: careers
            });
        } catch (error) {
            console.error("Error in getPendingCareers controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get career by ID
    static async getCareerById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid career ID"
                });
                return;
            }

            const career = await CareerService.getCareerById(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Career fetched successfully",
                data: career
            });
        } catch (error) {
            console.error("Error in getCareerById controller:", error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : "Career not found"
            });
        }
    }

    // Update career
    static async updateCareer(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { title, position, description, requirements, startsFrom, endsAt } = req.body;
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
                    message: "Invalid career ID"
                });
                return;
            }

            // Parse dates if provided
            let parsedStartsFrom: Date | null | undefined = undefined;
            let parsedEndsAt: Date | null | undefined = undefined;

            if (startsFrom !== undefined) {
                if (startsFrom === null || startsFrom === '') {
                    parsedStartsFrom = null;
                } else {
                    parsedStartsFrom = new Date(startsFrom);
                    if (isNaN(parsedStartsFrom.getTime())) {
                        res.status(400).json({
                            success: false,
                            message: "Invalid startsFrom date format"
                        });
                        return;
                    }
                }
            }

            if (endsAt !== undefined) {
                if (endsAt === null || endsAt === '') {
                    parsedEndsAt = null;
                } else {
                    parsedEndsAt = new Date(endsAt);
                    if (isNaN(parsedEndsAt.getTime())) {
                        res.status(400).json({
                            success: false,
                            message: "Invalid endsAt date format"
                        });
                        return;
                    }
                }
            }

            // Validate date logic if both dates are being set
            if (parsedStartsFrom && parsedEndsAt && parsedStartsFrom >= parsedEndsAt) {
                res.status(400).json({
                    success: false,
                    message: "Start date must be before end date"
                });
                return;
            }

            const updatedCareer = await CareerService.updateCareer(
                parseInt(id),
                title,
                position,
                description,
                requirements,
                parsedStartsFrom,
                parsedEndsAt,
                updatedBy
            );

            res.status(200).json({
                success: true,
                message: "Career updated successfully",
                data: updatedCareer
            });
        } catch (error) {
            console.error("Error in updateCareer controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Deactivate career (soft delete)
    static async deactivateCareer(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid career ID"
                });
                return;
            }

            const deactivatedCareer = await CareerService.deactivateCareer(parseInt(id), updatedBy);
            res.status(200).json({
                success: true,
                message: "Career deactivated successfully",
                data: deactivatedCareer
            });
        } catch (error) {
            console.error("Error in deactivateCareer controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Permanently delete career
    static async deleteCareer(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid career ID"
                });
                return;
            }

            const result = await CareerService.deleteCareer(parseInt(id));
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in deleteCareer controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }

    // Manual trigger for updating career statuses (admin endpoint)
    static async updateCareerStatuses(req: Request, res: Response): Promise<void> {
        try {
            const result = await CareerService.updateCareerStatuses();
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            console.error("Error in updateCareerStatuses controller:", error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal server error"
            });
        }
    }
}

export default CareerController;