import Download from '../models/Download';
import User from '../models/User';
import { UserHelper } from '../utils/userHelper';

class DownloadService {
    // Create a new Download
    async createDownload(
        label: string,
        description: string,
        fileType: string,
        fileUrl: string,
        createdBy: string
    ) {
        try {
            // Validate user exists
            const user = await User.findByPk(createdBy);
            if (!user) {
                throw new Error('User not found');
            }

            // Validate fileType
            if (!['image', 'pdf'].includes(fileType)) {
                throw new Error('File type must be either "image" or "pdf"');
            }

            const newDownload = await Download.create({
                label,
                description,
                fileType,
                fileUrl,
                createdBy,
                isActive: true,
                updatedBy: null
            });

            return newDownload;
        } catch (error) {
            console.error('Error in createDownload service:', error);
            throw error;
        }
    }

    // Get all active downloads
    async getAllActiveDownloads() {
        try {
            const downloads = await Download.findAll({
                where: {
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each download with creator and updater information
            const enhancedDownloads = await Promise.all(
                downloads.map(async (download: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(download.createdBy));
                    const updatedByUser = download.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(download.updatedBy))
                        : null;

                    return {
                        ...download.toJSON(),
                        fileUrl: `${process.env.SERVER_URL}${download.fileUrl}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedDownloads;
        } catch (error) {
            console.error('Error in getAllActiveDownloads service:', error);
            throw error;
        }
    }

    // Get all downloads (including inactive)
    async getAllDownloads() {
        try {
            const downloads = await Download.findAll({
                order: [['createdAt', 'DESC']]
            });

            // Enhance each download with creator and updater information
            const enhancedDownloads = await Promise.all(
                downloads.map(async (download: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(download.createdBy));
                    const updatedByUser = download.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(download.updatedBy))
                        : null;

                    return {
                        ...download.toJSON(),
                        fileUrl: `${process.env.SERVER_URL}${download.fileUrl}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedDownloads;
        } catch (error) {
            console.error('Error in getAllDownloads service:', error);
            throw error;
        }
    }

    // Get download by ID
    async getDownloadById(id: number) {
        try {
            const download = await Download.findByPk(id);
            if (!download) {
                throw new Error('Download not found');
            }

            // Get creator and updater full names
            const createdByUser = await UserHelper.getUserFullNameById(parseInt(download.createdBy));
            const updatedByUser = download.updatedBy 
                ? await UserHelper.getUserFullNameById(parseInt(download.updatedBy))
                : null;

            // Return download with full name information and full file URL
            return {
                ...download.toJSON(),
                fileUrl: `${process.env.SERVER_URL}${download.fileUrl}`,
                createdByUser: createdByUser,
                updatedByUser: updatedByUser
            };
        } catch (error) {
            console.error('Error in getDownloadById service:', error);
            throw error;
        }
    }

    // Update download
    async updateDownload(
        id: number,
        label?: string,
        description?: string,
        fileType?: string,
        fileUrl?: string,
        updatedBy?: string
    ) {
        try {
            const existingDownload = await Download.findByPk(id);
            if (!existingDownload) {
                throw new Error('Download not found');
            }

            // Validate user exists if updatedBy is provided
            if (updatedBy) {
                const user = await User.findByPk(updatedBy);
                if (!user) {
                    throw new Error('User not found');
                }
            }

            // Validate fileType if provided
            if (fileType && !['image', 'pdf'].includes(fileType)) {
                throw new Error('File type must be either "image" or "pdf"');
            }

            const updateData: any = {
                updatedAt: new Date()
            };

            if (label !== undefined) updateData.label = label;
            if (description !== undefined) updateData.description = description;
            if (fileType !== undefined) updateData.fileType = fileType;
            if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
            if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

            await existingDownload.update(updateData);

            // Return updated download with user information
            return await this.getDownloadById(id);
        } catch (error) {
            console.error('Error in updateDownload service:', error);
            throw error;
        }
    }

    // Deactivate download (soft delete)
    async deactivateDownload(id: number, updatedBy: string) {
        try {
            const download = await Download.findByPk(id);
            if (!download) {
                throw new Error('Download not found');
            }

            // Validate user exists
            const user = await User.findByPk(updatedBy);
            if (!user) {
                throw new Error('User not found');
            }

            await download.update({
                isActive: false,
                updatedBy: updatedBy,
                updatedAt: new Date()
            });

            return download;
        } catch (error) {
            console.error('Error in deactivateDownload service:', error);
            throw error;
        }
    }

    // Permanently delete download
    async deleteDownload(id: number) {
        try {
            const download = await Download.findByPk(id);
            if (!download) {
                throw new Error('Download not found');
            }

            await download.destroy();
            return { message: 'Download permanently deleted' };
        } catch (error) {
            console.error('Error in deleteDownload service:', error);
            throw error;
        }
    }

    // Get downloads by file type
    async getDownloadsByFileType(fileType: string) {
        try {
            // Validate fileType
            if (!['image', 'pdf'].includes(fileType)) {
                throw new Error('File type must be either "image" or "pdf"');
            }

            const downloads = await Download.findAll({
                where: {
                    fileType: fileType,
                    isActive: true
                },
                order: [['createdAt', 'DESC']]
            });

            // Enhance each download with creator and updater information
            const enhancedDownloads = await Promise.all(
                downloads.map(async (download: any) => {
                    const createdByUser = await UserHelper.getUserFullNameById(parseInt(download.createdBy));
                    const updatedByUser = download.updatedBy 
                        ? await UserHelper.getUserFullNameById(parseInt(download.updatedBy))
                        : null;

                    return {
                        ...download.toJSON(),
                        fileUrl: `${process.env.SERVER_URL}${download.fileUrl}`,
                        createdByUser: createdByUser,
                        updatedByUser: updatedByUser
                    };
                })
            );

            return enhancedDownloads;
        } catch (error) {
            console.error('Error in getDownloadsByFileType service:', error);
            throw error;
        }
    }
}


const downloadService = new DownloadService();
export default downloadService;