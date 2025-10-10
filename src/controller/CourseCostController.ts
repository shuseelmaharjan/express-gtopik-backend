import { Request, Response } from 'express';
import CourseCostService from '../service/CourseCostService';
import UidHelper from '../utils/uidHelper';

class CourseCostController {
    // Create a new course cost
    static async createCourseCost(req: Request, res: Response): Promise<void> {
        try {
            const { currency, cost, course_id } = req.body;
            const createdBy = UidHelper.getUserId(req.headers);
            
            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!currency || cost === undefined || !course_id) {
                res.status(400).json({
                    success: false,
                    message: "currency, cost, and course_id are required"
                });
                return;
            }

            // Validate field types
            if (typeof currency !== 'string' || currency.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "currency must be a non-empty string"
                });
                return;
            }

            if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
                res.status(400).json({
                    success: false,
                    message: "cost must be a non-negative number"
                });
                return;
            }

            if (isNaN(parseInt(course_id))) {
                res.status(400).json({
                    success: false,
                    message: "course_id must be a valid number"
                });
                return;
            }

            const courseCostData = {
                currency,
                cost: parseFloat(cost),
                course_id: parseInt(course_id),
                createdBy
            };

            const newCourseCost = await CourseCostService.createCourseCost(courseCostData);
            
            res.status(201).json({
                success: true,
                message: "Course cost created successfully",
                data: newCourseCost
            });
        } catch (error: any) {
            console.error("Error in createCourseCost controller:", error);
            
            if (error.message && error.message.startsWith('Error creating course cost:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error creating course cost: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update course cost (deactivate existing and create new)
    static async updateCourseCost(req: Request, res: Response): Promise<void> {
        try {
            const { currency, cost, course_id } = req.body;
            const updatedBy = UidHelper.getUserId(req.headers);

            console.log("Request body:", req.body);
            
            if (!updatedBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!currency || cost === undefined || !course_id) {
                res.status(400).json({
                    success: false,
                    message: "currency, cost, and course_id are required"
                });
                return;
            }

            // Validate field types
            if (typeof currency !== 'string' || currency.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "currency must be a non-empty string"
                });
                return;
            }

            if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
                res.status(400).json({
                    success: false,
                    message: "cost must be a non-negative number"
                });
                return;
            }

            if (isNaN(parseInt(course_id))) {
                res.status(400).json({
                    success: false,
                    message: "course_id must be a valid number"
                });
                return;
            }

            const courseCostData = {
                currency,
                cost: parseFloat(cost),
                course_id: parseInt(course_id),
                updatedBy
            };

            const result = await CourseCostService.updateCourseCost(courseCostData);
            
            res.status(200).json({
                success: true,
                message: `Course cost updated successfully. ${result.deactivatedCount} previous record(s) deactivated.`,
                data: {
                    newCourseCost: result.newCourseCost,
                    deactivatedRecords: result.deactivatedCount
                }
            });
        } catch (error: any) {
            console.error("Error in updateCourseCost controller:", error);
            
            if (error.message && error.message.startsWith('Error updating course cost:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating course cost: ', '')
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

export default CourseCostController;