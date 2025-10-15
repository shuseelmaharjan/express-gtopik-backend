import { Request, Response } from "express";

import { UserService } from "../service/UserService";
import UidHelper from "../utils/uidHelper";

export class UserController{
    //get user's username, email, role and profile by id
    static async getUserProfile(req: Request, res: Response) {
        try{
           const userId = req.user.id;
           const profile = await UserService.getUserProfile(userId);
           res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: profile
           });

        }catch(error){
            console.error("Error in getUserProfile controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    //static method to deactivate user account
    static async deactivateUserAccount(req: Request, res: Response): Promise<void>{
        try{
            const userId = UidHelper.getUserId(req.headers);
            if(!userId){
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }
            const result = await UserService.deactivateUserAccount(Number(userId));
            if(result){
                res.status(200).json({
                    success: true,
                    message: "User account deactivated successfully"
                });
            } else{
                res.status(400).json({
                    success: false,
                    message: "Failed to deactivate user account"
                });
            }
        } catch(error){
            console.error("Error in deactivateUserAccount controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Create user
    static async createUser(req: Request, res: Response) {
        try {
            const created = await UserService.createUser(req.body);
            res.status(201).json({ success: true, message: 'User created successfully', data: created });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to create user' });
        }
    }

    // Read full user by id
    static async getUserById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const user = await UserService.getUserByIdFull(id);
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Update user
    static async updateUser(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const updated = await UserService.updateUser(id, req.body);
            res.status(200).json({ success: true, message: 'User updated successfully', data: updated });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({ success: false, message: 'User not found' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to update user' });
            }
        }
    }

    // Create comprehensive user with document handling
    static async createUserWithDocuments(req: Request, res: Response) {
        try {
            // Get createdBy from authenticated user (assuming you have auth middleware)
            const createdBy = UidHelper.getUserId(req.headers);

            if(!createdBy){
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }
            
            // Extract files from request
            const files = (req as any).files || {};
            
            // Create user with documents
            const result = await UserService.createUserWithDocuments(req.body, files, Number(createdBy));
            
            res.status(201).json({
                success: true,
                message: 'User created successfully with documents',
                data: {
                    user: result.user,
                    uploadedDocuments: result.uploadedDocuments,
                    generatedUsername: result.generatedUsername,
                    defaultPassword: process.env.DEFAULT_USER_PASSWORD || 'Nepal123' // Let them know the default password 
                }
            });
        } catch (error: any) {
            console.error('Error in createUserWithDocuments controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create user with documents'
            });
        }
    }

    // Get drafted users with optional role filtering
    static async getDraftedUsers(req: Request, res: Response) {
        try {
            const { role } = req.params;
            
            const draftedUsers = await UserService.getDraftedUsers(role as string);
            
            res.status(200).json({
                success: true,
                message: 'Drafted users fetched successfully',
                data: {
                    users: draftedUsers,
                    total: draftedUsers.length,
                    role: role || 'all'
                }
            });
        } catch (error: any) {
            console.error('Error in getDraftedUsers controller:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch drafted users'
            });
        }
    }

    // Get user information for enrollment
    static async getUserInfoForEnrollment(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            
            if (isNaN(parseInt(userId))) {
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }

            const userInfo = await UserService.getUserInfoForEnrollment(parseInt(userId));
            
            res.status(200).json({
                success: true,
                message: 'User information for enrollment fetched successfully',
                data: userInfo
            });
        } catch (error: any) {
            console.error('Error in getUserInfoForEnrollment controller:', error);
            
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch user information for enrollment'
            });
        }
    }

    // Get all enrolled students with their enrollment information
    static async getEnrolledStudentsWithEnrollmentInfo(req: Request, res: Response) {
        try {
            const enrolledStudents = await UserService.getEnrolledStudentsWithEnrollmentInfo();
            
            res.status(200).json({
                success: true,
                message: 'Enrolled students with enrollment information fetched successfully',
                data: {
                    students: enrolledStudents,
                    total: enrolledStudents.length
                }
            });
        } catch (error: any) {
            console.error('Error in getEnrolledStudentsWithEnrollmentInfo controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch enrolled students with enrollment information'
            });
        }
    }

    // Search enrolled students with their enrollment information
    static async searchEnrolledStudentsWithEnrollmentInfo(req: Request, res: Response) {
        try {
            const searchQuery = req.query.q as string;
            
            if (!searchQuery || searchQuery.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Search query parameter "q" is required'
                });
                return;
            }

            const searchResults = await UserService.searchEnrolledStudentsWithEnrollmentInfo(searchQuery);
            
            res.status(200).json({
                success: true,
                message: 'Enrolled students search completed successfully',
                data: {
                    students: searchResults,
                    total: searchResults.length,
                    searchQuery: searchQuery
                }
            });
        } catch (error: any) {
            console.error('Error in searchEnrolledStudentsWithEnrollmentInfo controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search enrolled students with enrollment information'
            });
        }
    }

    //get all user informations as kundali
    static async getUserAllInformationById(req: Request, res: Response){
        try{
            const userId = Number(req.params.id);
            if(isNaN(userId)){
                res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }
            const userInfo = await UserService.getUserAllInformationById(userId);
            res.status(200).json({
                success: true,
                message: 'User information fetched successfully',
                data: userInfo
            });
        } catch (error: any) {
            console.error('Error in getUserAllInformationById controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch user information'
            });
        }
    }

}