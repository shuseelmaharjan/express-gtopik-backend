import express, { Application, Request, Response, NextFunction } from 'express';
import { DateTimeHelper } from './utils/DateTimeHelper';
import cookieParser from 'cookie-parser';

const app: Application = express();

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


// Authentication routes
app.use('/api/auth', authRoutes);

export default app;
