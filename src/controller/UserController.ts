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
}