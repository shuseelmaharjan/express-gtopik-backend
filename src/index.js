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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const seedData_1 = require("./utils/seedData");
//Import database Objects and set up associations
require("./models/associations");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.authenticate();
        console.log('Database connected');
        // Sync database safely:
        // - Creates tables if they don't exist
        // - Does NOT drop existing tables or data
        // - Use 'alter: true' only in development to update table structure
        yield database_1.default.sync({
            force: false,
            alter: false // Set to true only in development to update table structure
        });
        console.log('Database synchronized successfully');
        // Create superadmin user after database sync
        yield (0, seedData_1.createSuperAdmin)();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
});
startServer();
