import express, { Application, Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { DateTimeHelper } from './utils/DateTimeHelper';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// CORS middleware for allowing access from localhost:3000
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

console.log('CORS enabled for origin:', process.env.CLIENT_URL);

// JSON parsing with error handling
app.use(express.json({ limit: '10mb' }));

// File upload middleware (5MB limit, use temp files false -> memory; can adjust if needed)
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: false,
  createParentPath: true
}));

// Error handler for JSON parsing errors
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
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
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = DateTimeHelper.getDateTime();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log all requests with method, URL, and IP
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
});

// Cookie parser middleware
app.use(cookieParser());

//Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve uploaded profile images statically
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));


// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import facultyRoutes from './routes/facultyRoutes';
import departmentRoutes from './routes/departmentRoutes';
import sessionRoutes from './routes/sessionRoutes';
import classRoutes from './routes/classRoutes';
import classSectionRoutes from './routes/classSectionRoutes';
import coursesRoutes from './routes/coursesRoutes';
import courseCostRoutes from './routes/courseCostRoutes';
import feeStructureRoutes from './routes/feeStructureRoutes';
import studentEnrollmentRoutes from './routes/studentEnrollmentRoutes';



// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', facultyRoutes);
app.use('/api', departmentRoutes);
app.use('/api', sessionRoutes);
app.use('/api', classRoutes);
app.use('/api', classSectionRoutes);
app.use('/api', coursesRoutes);
app.use('/api', courseCostRoutes);
app.use('/api', feeStructureRoutes);
app.use('/api', studentEnrollmentRoutes);

export default app;
