import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import OrganizationService from '../service/OrganizationService';
import UidHelper from '../utils/uidHelper';

class OrganizationController {
    /**
     * Create a new organization
     * POST /api/v1/organization
     */
    static async createOrganization(req: Request, res: Response): Promise<void> {
        try {
            const {
                organizationName,
                address,
                phone,
                email,
                website,
                registrationNumber,
                panNumber
            } = req.body;

            console.log('Received organization creation request with body:', req.body);
            // Get logo file if uploaded
            const logoFile = (req.files?.logo as UploadedFile) || undefined;

            // Validation
            if (!organizationName || !address || !phone || !email) {
                res.status(400).json({
                    success: false,
                    message: 'Organization name, address, phone, and email are required'
                });
                return;
            }

            const createdBy =  UidHelper.getUserId(req.headers);

            
            const result = await OrganizationService.createOrganization({
                organizationName,
                address,
                phone,
                email,
                website,
                registrationNumber,
                panNumber,
                logoFile,
                createdBy: parseInt(createdBy!, 10)
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in createOrganization controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all organizations
     * GET /api/v1/organization
     */
    static async getAllOrganizations(req: Request, res: Response): Promise<void> {
        try {
            const result = await OrganizationService.getAllOrganizations();

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in getAllOrganizations controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get organization by ID
     * GET /api/v1/organization/:id
     */
    static async getOrganizationById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid organization ID'
                });
                return;
            }

            const result = await OrganizationService.getOrganizationById(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in getOrganizationById controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update organization
     * PUT /api/v1/organization/:id
     */
    static async updateOrganization(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid organization ID'
                });
                return;
            }

            const userId = UidHelper.getUserId(req.headers);


            const {
                organizationName,
                address,
                phone,
                email,
                website,
                registrationNumber,
                panNumber
            } = req.body;

            // Get logo file if uploaded
            const logoFile = (req.files?.logo as UploadedFile) || undefined;

            const result = await OrganizationService.updateOrganization(id, {
                organizationName,
                address,
                phone,
                email,
                website,
                registrationNumber,
                panNumber,
                logoFile,
                updatedBy: parseInt(userId!, 10)
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in updateOrganization controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete organization
     * DELETE /api/v1/organization/:id
     */
    static async deleteOrganization(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid organization ID'
                });
                return;
            }

            const result = await OrganizationService.deleteOrganization(id);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Error in deleteOrganization controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default OrganizationController;
