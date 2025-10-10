import FeeStructure from '../models/FeeStructure';
import { Op } from 'sequelize';

class FeeStructureService {
    // Create a new fee structure
    async createFeeStructure(feeStructureData: {
        feeType: string;
        amount: number;
        description?: string;
        requireonAdmission?: boolean;
        requireonUpgrade?: boolean;
        requireonRenewal?: boolean;
        createdBy: string;
    }) {
        try {

            console.log('Service - createFeeStructure called with:', feeStructureData);
            // Check if feeType already exists
            const existingFeeStructure = await FeeStructure.findOne({
                where: {
                    feeType: feeStructureData.feeType.trim(),
                    isActive: true
                }
            });
            if (existingFeeStructure) {
                throw new Error('Fee type already exists');
            }

            const newFeeStructure = await FeeStructure.create({
                feeType: feeStructureData.feeType.trim(),
                amount: feeStructureData.amount,
                currency: 'npr',
                description: feeStructureData.description || null,
                requireonAdmission: feeStructureData.requireonAdmission || false,
                requireonUpgrade: feeStructureData.requireonUpgrade || false,
                requireonRenewal: feeStructureData.requireonRenewal || false,
                createdBy: feeStructureData.createdBy,
                isActive: true
            });

            return newFeeStructure;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating fee structure: ${error.message}`);
            } else {
                throw new Error('Error creating fee structure: Unknown error');
            }
        }
    }

    // Get all active fee structures
    async getAllFeeStructures() {
        try {
            const feeStructures = await FeeStructure.findAll({
                where: { isActive: true },
                order: [['createdAt', 'DESC']]
            });

            return feeStructures;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching fee structures: ${error.message}`);
            } else {
                throw new Error('Error fetching fee structures: Unknown error');
            }
        }
    }

    // Get fee structure by ID
    async getFeeStructureById(id: number) {
        try {
            const feeStructure = await FeeStructure.findByPk(id);

            if (!feeStructure) {
                throw new Error('Fee structure not found');
            }

            return feeStructure;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching fee structure: ${error.message}`);
            } else {
                throw new Error('Error fetching fee structure: Unknown error');
            }
        }
    }

    // Update fee structure
    async updateFeeStructure(id: number, updatedBy: string, updates: {
        feeType?: string;
        amount?: number;
        description?: string;
        requireonAdmission?: boolean;
        requireonUpgrade?: boolean;
        requireonRenewal?: boolean;
    }) {
        try {
            console.log('Service - updateFeeStructure called with:', { id, updatedBy, updates });
            
            const feeStructure = await FeeStructure.findByPk(id);
            if (!feeStructure) {
                throw new Error('Fee structure not found');
            }

            console.log('Service - Current fee structure before update:', feeStructure.toJSON());

            // If feeType is being updated, check for uniqueness among active records
            if (updates.feeType !== undefined) {
                const trimmedFeeType = updates.feeType.trim();
                // Only check for duplicates if the feeType is actually changing
                if (trimmedFeeType !== feeStructure.feeType) {
                    const existingFeeStructure = await FeeStructure.findOne({
                        where: {
                            feeType: trimmedFeeType,
                            id: { [Op.ne]: id },
                            isActive: true
                        }
                    });
                    if (existingFeeStructure) {
                        throw new Error('Fee type already exists');
                    }
                }
            }

            // Update fields
            if (updates.feeType !== undefined) feeStructure.feeType = updates.feeType.trim();
            if (updates.amount !== undefined) feeStructure.amount = updates.amount;
            if (updates.description !== undefined) feeStructure.description = updates.description;
            if (updates.requireonAdmission !== undefined) feeStructure.requireonAdmission = updates.requireonAdmission;
            if (updates.requireonUpgrade !== undefined) feeStructure.requireonUpgrade = updates.requireonUpgrade;
            if (updates.requireonRenewal !== undefined) feeStructure.requireonRenewal = updates.requireonRenewal;
            
            feeStructure.updatedBy = updatedBy;
            feeStructure.updatedAt = new Date();
            
            console.log('Service - Fee structure before save:', feeStructure.toJSON());
            
            await feeStructure.save();
            
            console.log('Service - Fee structure after save:', feeStructure.toJSON());
            
            return feeStructure;
        } catch (error: any) {
            console.error('Detailed error in updateFeeStructure:', error);
            
            if (error instanceof Error) {
                // Check if it's a Sequelize validation error
                if (error.name === 'SequelizeValidationError') {
                    const validationErrors = (error as any).errors?.map((e: any) => e.message).join(', ') || 'Validation failed';
                    throw new Error(`Validation error: ${validationErrors}`);
                }
                // Check if it's a unique constraint error
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new Error('Fee type already exists');
                }
                throw new Error(`Error updating fee structure: ${error.message}`);
            } else {
                throw new Error('Error updating fee structure: Unknown error');
            }
        }
    }

    // Soft delete fee structure (set isActive to false)
    async deleteFeeStructure(id: number, updatedBy: string) {
        try {
            const feeStructure = await FeeStructure.findByPk(id);
            if (!feeStructure) {
                throw new Error('Fee structure not found');
            }

            // Soft delete: set isActive to false
            feeStructure.isActive = false;
            feeStructure.updatedBy = updatedBy;
            feeStructure.updatedAt = new Date();
            
            await feeStructure.save();
            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting fee structure: ${error.message}`);
            } else {
                throw new Error('Error deleting fee structure: Unknown error');
            }
        }
    }

    // Get fee structures by requirement type
    async getFeeStructuresByRequirement(requirementType: 'admission' | 'upgrade' | 'renewal') {
        try {
            const whereClause: any = { isActive: true };
            
            switch (requirementType) {
                case 'admission':
                    whereClause.requireonAdmission = true;
                    break;
                case 'upgrade':
                    whereClause.requireonUpgrade = true;
                    break;
                case 'renewal':
                    whereClause.requireonRenewal = true;
                    break;
            }

            const feeStructures = await FeeStructure.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            return feeStructures;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching fee structures by requirement: ${error.message}`);
            } else {
                throw new Error('Error fetching fee structures by requirement: Unknown error');
            }
        }
    }
}

export default new FeeStructureService();