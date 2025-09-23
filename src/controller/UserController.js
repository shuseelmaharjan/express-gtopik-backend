"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../service/UserService");
class UserController {
    //get user's username, email, role and profile by id
    static getUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const profile = yield UserService_1.UserService.getUserProfile(userId);
                res.status(200).json({
                    success: true,
                    message: "User profile fetched successfully",
                    data: profile
                });
            }
            catch (error) {
                console.error("Error in getUserProfile controller:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        });
    }
}
exports.UserController = UserController;
