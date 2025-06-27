import express, { Application, Request, Response, NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import { DateTimeHelper } from './utils/DateTimeHelper';

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
  console.log(`[${timestamp}] ${url} - IP: ${ip}`);
  
  // Log request body for requests that typically have body data (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(req.body).length > 0) {
    const body = { ...req.body };
    // Hide password in logs for security
    if (body.password) {
      body.password = '***hidden***';
    }
    // console.log(`[${timestamp}] Request Body:`, JSON.stringify(body, null, 2));
  }
  
  // Log query parameters for GET requests if they exist
  if (method === 'GET' && Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  next();
});

//Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Authentication routes
app.use('/api/auth', authRoutes);

export default app;
