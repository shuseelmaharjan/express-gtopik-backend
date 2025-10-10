import { Request, Response } from 'express';
import FeeStructureService from '../service/FeeStructureService';
import UidHelper from '../utils/uidHelper';

class FeeStructureController {
    // Create a new fee structure
    static async createFeeStructure(req: Request, res: Response): Promise<void> {
        try {
            const {
                feeType,
                amount,
                description,
                requireonAdmission,
                requireonUpgrade,
                requireonRenewal
            } = req.body;
            

            console.log('Request body:', req.body);
            const createdBy = UidHelper.getUserId(req.headers);
            
            if (!createdBy) {
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            // Validate required fields
            if (!feeType || amount === undefined) {
                res.status(400).json({
                    success: false,
                    message: "feeType and amount are required"
                });
                return;
            }

            // Validate field types
            if (typeof feeType !== 'string' || feeType.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "feeType must be a non-empty string"
                });
                return;
            }

            if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
                res.status(400).json({
                    success: false,
                    message: "amount must be a non-negative number"
                });
                return;
            }

            const feeStructureData = {
                feeType,
                amount: parseFloat(amount),
                description,
                requireonAdmission,
                requireonUpgrade,
                requireonRenewal,
                createdBy
            };

            const newFeeStructure = await FeeStructureService.createFeeStructure(feeStructureData);
            
            res.status(201).json({
                success: true,
                message: "Fee structure created successfully",
                data: newFeeStructure
            });
        } catch (error: any) {
            console.error("Error in createFeeStructure controller:", error);
            
            if (error.message && error.message.startsWith('Error creating fee structure:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error creating fee structure: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all active fee structures
    static async getAllFeeStructures(req: Request, res: Response): Promise<void> {
        try {
            const feeStructures = await FeeStructureService.getAllFeeStructures();
            
            res.status(200).json({
                success: true,
                message: "Fee structures fetched successfully",
                data: feeStructures
            });
        } catch (error: any) {
            console.error("Error in getAllFeeStructures controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching fee structures:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching fee structures: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get fee structure by ID
    static async getFeeStructureById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            if (isNaN(parseInt(id))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid fee structure ID"
                });
                return;
            }

            const feeStructure = await FeeStructureService.getFeeStructureById(parseInt(id));
            
            res.status(200).json({
                success: true,
                message: "Fee structure fetched successfully",
                data: feeStructure
            });
        } catch (error: any) {
            console.error("Error in getFeeStructureById controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching fee structure:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching fee structure: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update fee structure
    static async updateFeeStructure(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {
                feeType,
                amount,
                description,
                requireonAdmission,
                requireonUpgrade,
                requireonRenewal
            } = req.body;

            // Debug logging
            console.log('Update Request - ID:', id);
            console.log('Update Request - Body:', req.body);
            console.log('Update Request - Individual fields:', {
                feeType, amount, description, requireonAdmission, requireonUpgrade, requireonRenewal
            });
            
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
                    message: "Invalid fee structure ID"
                });
                return;
            }

            // Validate that at least one field is provided for update
            const hasUpdates = feeType !== undefined || amount !== undefined || 
                              description !== undefined || requireonAdmission !== undefined || 
                              requireonUpgrade !== undefined || requireonRenewal !== undefined;

            if (!hasUpdates) {
                res.status(400).json({
                    success: false,
                    message: "At least one field must be provided for update"
                });
                return;
            }

            // Validate field types if provided
            if (feeType !== undefined && (typeof feeType !== 'string' || feeType.trim().length === 0)) {
                res.status(400).json({
                    success: false,
                    message: "feeType must be a non-empty string"
                });
                return;
            }

            if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
                res.status(400).json({
                    success: false,
                    message: "amount must be a non-negative number"
                });
                return;
            }

            const updates: any = {};
            if (feeType !== undefined) updates.feeType = feeType;
            if (amount !== undefined) updates.amount = parseFloat(amount);
            if (description !== undefined) updates.description = description;
            
            // Properly handle boolean fields - convert string values and handle both true/false
            if (requireonAdmission !== undefined) {
                if (typeof requireonAdmission === 'boolean') {
                    updates.requireonAdmission = requireonAdmission;
                } else if (typeof requireonAdmission === 'string') {
                    updates.requireonAdmission = requireonAdmission.toLowerCase() === 'true';
                } else {
                    updates.requireonAdmission = Boolean(requireonAdmission);
                }
            }
            
            if (requireonUpgrade !== undefined) {
                if (typeof requireonUpgrade === 'boolean') {
                    updates.requireonUpgrade = requireonUpgrade;
                } else if (typeof requireonUpgrade === 'string') {
                    updates.requireonUpgrade = requireonUpgrade.toLowerCase() === 'true';
                } else {
                    updates.requireonUpgrade = Boolean(requireonUpgrade);
                }
            }
            
            if (requireonRenewal !== undefined) {
                if (typeof requireonRenewal === 'boolean') {
                    updates.requireonRenewal = requireonRenewal;
                } else if (typeof requireonRenewal === 'string') {
                    updates.requireonRenewal = requireonRenewal.toLowerCase() === 'true';
                } else {
                    updates.requireonRenewal = Boolean(requireonRenewal);
                }
            }

            console.log('Final updates object being sent to service:', updates);

            const updatedFeeStructure = await FeeStructureService.updateFeeStructure(parseInt(id), updatedBy, updates);
            
            res.status(200).json({
                success: true,
                message: "Fee structure updated successfully",
                data: updatedFeeStructure
            });
        } catch (error: any) {
            console.error("Error in updateFeeStructure controller:", error);
            
            if (error.message && error.message.startsWith('Error updating fee structure:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating fee structure: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Delete fee structure (soft delete)
    static async deleteFeeStructure(req: Request, res: Response): Promise<void> {
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
                    message: "Invalid fee structure ID"
                });
                return;
            }

            const result = await FeeStructureService.deleteFeeStructure(parseInt(id), updatedBy);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: "Fee structure deleted successfully"
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Failed to delete fee structure"
                });
            }
        } catch (error: any) {
            console.error("Error in deleteFeeStructure controller:", error);
            
            if (error.message && error.message.startsWith('Error deleting fee structure:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error deleting fee structure: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get fee structures by requirement type
    static async getFeeStructuresByRequirement(req: Request, res: Response): Promise<void> {
        try {
            const { requirement } = req.params;
            
            if (!['admission', 'upgrade', 'renewal'].includes(requirement)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid requirement type. Must be 'admission', 'upgrade', or 'renewal'"
                });
                return;
            }

            const feeStructures = await FeeStructureService.getFeeStructuresByRequirement(requirement as 'admission' | 'upgrade' | 'renewal');
            
            res.status(200).json({
                success: true,
                message: `Fee structures for ${requirement} fetched successfully`,
                data: feeStructures
            });
        } catch (error: any) {
            console.error("Error in getFeeStructuresByRequirement controller:", error);
            
            if (error.message && error.message.startsWith('Error fetching fee structures by requirement:')) {
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching fee structures by requirement: ', '')
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

export default FeeStructureController;