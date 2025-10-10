import {Request, Response} from 'express';
import ClassService from '../service/ClassService';
import UidHelper from '../utils/uidHelper';

class ClassController{
    // create a new classroom
    static async createClass(req: Request, res: Response): Promise<void>{
        try{
            const { className, faculty_id, department_id } = req.body;
            console.log("Request body:", req.body);
            const createdBy = UidHelper.getUserId(req.headers);
            if(!createdBy){
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }
            if(!className || !faculty_id || !department_id){
                res.status(400).json({
                    success: false,
                    message: "className, faculty_id and department_id are required"
                });
                return;
            }
            if(typeof className !== 'string' || className.trim().length === 0){
                res.status(400).json({
                    success: false,
                    message: "className must be a non-empty string"
                });
                return;
            }
            if(isNaN(parseInt(faculty_id)) || isNaN(parseInt(department_id))){
                res.status(400).json({
                    success: false,
                    message: "faculty_id and department_id must be valid numbers"
                });
                return;
            }
            const newClass = await ClassService.createClass(className, parseInt(faculty_id), parseInt(department_id), createdBy);
            res.status(201).json({
                success: true,
                message: "Class created successfully",
                data: newClass
            });
        } catch(error){
            console.error("Error in createClass controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
    
    // get all active classes with faculty and department details
    static async getAllActiveClasses(req: Request, res: Response): Promise<void>{
        try{
            const classes = await ClassService.getAllActiveClasses();
            res.status(200).json({
                success: true,
                message: "Active classes fetched successfully",
                data: classes
            });
        } catch(error: any){
            console.error("Error in getAllActiveClasses controller:", error);
            
            // Handle specific service errors
            if(error.message && error.message.startsWith('Error fetching classes:')){
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error fetching classes: ', ''),
                    data: null
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error",
                data: null
            });
        }
    }

    // get specific class by ID with faculty and department details
    static async getClassById(req: Request, res: Response): Promise<void>{
        try{
            const { id } = req.params;
            if(isNaN(parseInt(id))){
                res.status(400).json({
                    success: false,
                    message: "Invalid class ID"
                });
                return;
            }
            const classInstance = await ClassService.getClassById(parseInt(id));
            if(!classInstance){
                res.status(404).json({
                    success: false,
                    message: "Class not found"
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Class fetched successfully",
                data: classInstance
            });
        }
        catch(error){
            console.error("Error in getClassById controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // static method to deactivate a class
    static async deactivateClass(req: Request, res: Response): Promise<void>{
        try{
            const { id } = req.params;
            if(isNaN(parseInt(id))){
                res.status(400).json({
                    success: false,
                    message: "Invalid class ID"
                });
                return;
            }
            const result = await ClassService.deleteClass(parseInt(id), UidHelper.getUserId(req.headers) || 'system');
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Class deactivated successfully"
                });
            }
            else{
                res.status(400).json({
                    success: false,
                    message: "Failed to deactivate class"
                });
            }
        } catch(error){
            console.error("Error in deactivateClass controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // static method to update class
    static async updateClass(req: Request, res: Response): Promise<void>{
        try{
            const { id } = req.params;
            const { className } = req.body;
            const updatedBy = UidHelper.getUserId(req.headers);
            
            if(!updatedBy){
                res.status(400).json({
                    success: false,
                    message: "User ID is required in headers"
                });
                return;
            }

            if(isNaN(parseInt(id))){
                res.status(400).json({
                    success: false,
                    message: "Invalid class ID"
                });
                return;
            }

            // Validate that at least one field is provided for update
            if(!className){
                res.status(400).json({
                    success: false,
                    message: "At least one field (className) must be provided for update"
                });
                return;
            }

            // Validate className if provided
            if(className !== undefined && (typeof className !== 'string' || className.trim().length === 0)){
                res.status(400).json({
                    success: false,
                    message: "className must be a non-empty string"
                });
                return;
            }

            const updates: { className?: string; faculty_id?: number; department_id?: number } = {};
            if(className !== undefined) updates.className = className;

            const updatedClass = await ClassService.updateClass(parseInt(id), updatedBy, updates);
            
            res.status(200).json({
                success: true,
                message: "Class updated successfully",
                data: updatedClass
            });
        } catch(error: any){
            console.error("Error in updateClass controller:", error);
            
            // Handle specific service errors
            if(error.message && error.message.startsWith('Error updating class:')){
                res.status(400).json({
                    success: false,
                    message: error.message.replace('Error updating class: ', '')
                });
                return;
            }
            
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getClassesByDepartmentId(req: Request, res: Response): Promise<void>{
        try{
            const { departmentId } = req.params;
            if(isNaN(parseInt(departmentId))){
                res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }
            const classes = await ClassService.getClassesByDepartmentId(parseInt(departmentId));
            res.status(200).json({
                success: true,
                message: "Classes fetched successfully",
                data: classes
            });
        } catch(error){
            console.error("Error in getClassesByDepartmentId controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

}

export default ClassController;