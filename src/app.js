"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DateTimeHelper_1 = require("./utils/DateTimeHelper");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS middleware for allowing access from localhost:3000
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
console.log('CORS enabled for origin:', process.env.CLIENT_URL);
// JSON parsing with error handling
app.use(express_1.default.json({ limit: '10mb' }));
// Error handler for JSON parsing errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        console.error('JSON parsing error:', error.message);
        res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body'
        });
        return;
    }
    next();
});
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = DateTimeHelper_1.DateTimeHelper.getDateTime();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    // Log all requests with method, URL, and IP
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    next();
});
// Cookie parser middleware
app.use((0, cookie_parser_1.default)());
//Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const facultyRoutes_1 = __importDefault(require("./routes/facultyRoutes"));
const departmentRoutes_1 = __importDefault(require("./routes/departmentRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
// Authentication routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api', facultyRoutes_1.default);
app.use('/api', departmentRoutes_1.default);
app.use('/api', sessionRoutes_1.default);
exports.default = app;
