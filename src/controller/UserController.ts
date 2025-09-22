import { Request, Response } from "express";

import { UserService } from "../service/UserService";

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
}