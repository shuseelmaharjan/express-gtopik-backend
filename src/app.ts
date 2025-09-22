import express, { Application, Request, Response, NextFunction } from 'express';
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


// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import facultyRoutes from './routes/facultyRoutes';
import departmentRoutes from './routes/departmentRoutes';


// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', facultyRoutes);
app.use('/api', departmentRoutes);

export default app;
