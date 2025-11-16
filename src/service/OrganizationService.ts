import Organization from '../models/Organization';
import { UserHelper } from '../utils/userHelper';
import path from 'path';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';

interface CreateOrganizationData {
    organizationName: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    registrationNumber?: string;
    panNumber?: string;
    logoFile?: UploadedFile;
    createdBy: number;
}

interface UpdateOrganizationData {
    organizationName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    registrationNumber?: string;
    panNumber?: string;
    logoFile?: UploadedFile;
    updatedBy: number;
}

class OrganizationService {
    private static uploadDir = path.join(
        process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
        'organization'
    );

    /**
     * Ensure upload directory exists
     */
    private static ensureUploadDirExists() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Validate image file type (JPG and PNG only)
     */
    private static isValidImageType(mimetype: string): boolean {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        return validTypes.includes(mimetype.toLowerCase());
    }

    /**
     * Process and save logo (convert to JPG)
     */
    private static async processAndSaveLogo(file: UploadedFile): Promise<string> {
        this.ensureUploadDirExists();

        // Validate file type
        if (!this.isValidImageType(file.mimetype)) {
            throw new Error('Only JPG and PNG files are allowed');
        }

        // Generate unique filename with .jpg extension
        const uniqueFileName = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = path.join(this.uploadDir, uniqueFileName);

        try {
            // Convert image to JPG using sharp
            await sharp(file.data)
                .jpeg({ quality: 90 })
                .toFile(filePath);

            return `/uploads/organization/${uniqueFileName}`;
        } catch (error) {
            console.error('Error processing logo image:', error);
            throw new Error('Failed to process logo image');
        }
    }

    /**
     * Delete old logo file
     */
    private static deleteOldLogo(logoPath: string | null) {
        if (logoPath) {
            try {
                const fullPath = path.join(__dirname, '..', logoPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (error) {
                console.error('Error deleting old logo:', error);
            }
        }
    }

    /**
     * Helper method to format organization data with SERVER_URL for logo
     */
    private static formatOrganizationData(organization: any) {
        const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
        return {
            ...organization.toJSON(),
            logo: organization.logo ? `${serverUrl}${organization.logo}` : null
        };
    }

    /**
     * Create a new organization
     */
    static async createOrganization(data: CreateOrganizationData) {
        try {
            const createdByUser = await UserHelper.getUserFullNameById(data.createdBy);
            const createdByName = createdByUser?.fullName || 'Unknown';

            // Process logo file if provided
            let logoPath: string | null = null;
            if (data.logoFile) {
                logoPath = await this.processAndSaveLogo(data.logoFile);
            }

            const organization = await Organization.create({
                organizationName: data.organizationName,
                address: data.address,
                phone: data.phone,
                email: data.email,
                website: data.website || null,
                registrationNumber: data.registrationNumber || null,
                panNumber: data.panNumber || null,
                logo: logoPath,
                createdBy: createdByName,
                updatedBy: null
            });

            return {
                success: true,
                message: 'Organization created successfully',
                data: this.formatOrganizationData(organization)
            };
        } catch (error) {
            console.error('Error in createOrganization:', error);
            return {
                success: false,
                message: 'Failed to create organization',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get all organizations
     */
    static async getAllOrganizations() {
        try {
            const organizations = await Organization.findAll({
                order: [['id', 'DESC']]
            });

            const formattedOrganizations = organizations.map(org => this.formatOrganizationData(org));

            return {
                success: true,
                message: 'Organizations retrieved successfully',
                data: formattedOrganizations
            };
        } catch (error) {
            console.error('Error in getAllOrganizations:', error);
            return {
                success: false,
                message: 'Failed to retrieve organizations',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get organization by ID
     */
    static async getOrganizationById(id: number) {
        try {
            const organization = await Organization.findByPk(id);

            if (!organization) {
                return {
                    success: false,
                    message: 'Organization not found'
                };
            }

            return {
                success: true,
                message: 'Organization retrieved successfully',
                data: this.formatOrganizationData(organization)
            };
        } catch (error) {
            console.error('Error in getOrganizationById:', error);
            return {
                success: false,
                message: 'Failed to retrieve organization',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update organization
     */
    static async updateOrganization(id: number, data: UpdateOrganizationData) {
        try {
            const organization = await Organization.findByPk(id);

            if (!organization) {
                return {
                    success: false,
                    message: 'Organization not found'
                };
            }

            const updatedByUser = await UserHelper.getUserFullNameById(data.updatedBy);
            const updatedByName = updatedByUser?.fullName || 'Unknown';

            const updateData: any = {
                updatedBy: updatedByName,
                updatedAt: new Date()
            };

            if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
            if (data.address !== undefined) updateData.address = data.address;
            if (data.phone !== undefined) updateData.phone = data.phone;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.website !== undefined) updateData.website = data.website;
            if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
            if (data.panNumber !== undefined) updateData.panNumber = data.panNumber;
            
            // Process new logo file if provided
            if (data.logoFile) {
                // Delete old logo if exists
                this.deleteOldLogo(organization.logo);
                // Upload new logo
                updateData.logo = await this.processAndSaveLogo(data.logoFile);
            }

            await organization.update(updateData);

            return {
                success: true,
                message: 'Organization updated successfully',
                data: this.formatOrganizationData(organization)
            };
        } catch (error) {
            console.error('Error in updateOrganization:', error);
            return {
                success: false,
                message: 'Failed to update organization',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete organization
     */
    static async deleteOrganization(id: number) {
        try {
            const organization = await Organization.findByPk(id);

            if (!organization) {
                return {
                    success: false,
                    message: 'Organization not found'
                };
            }

            await organization.destroy();

            return {
                success: true,
                message: 'Organization deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteOrganization:', error);
            return {
                success: false,
                message: 'Failed to delete organization',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default OrganizationService;
