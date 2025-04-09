import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import documentRoutes from './routes/document.routes';
import chatRoutes from './routes/chat.routes';
import googleDriveRoutes from './routes/google-drive.routes';
import config from './config/index';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Ensure uploads directory exists
if (!fs.existsSync(config.paths.uploads)) {
  fs.mkdirSync(config.paths.uploads, { recursive: true });
  logger.info(`Created uploads directory at ${config.paths.uploads}`);
}

const app = express();
const port = config.port;

// Security middleware
app.use(
  helmet({
    // Only relax security settings in development mode
    ...(config.nodeEnv === 'development' ? {
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "unsafe-none" },
      // Disable content security policy in development
      contentSecurityPolicy: false
    } : {})
  })
);

// CORS configuration
app.use(cors({
  // Allow all origins in dev mode, or specific origins in production
  origin: config.nodeEnv === 'production'
    ? [config.cors.origin, ...config.cors.additionalOrigins]
    : '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'rag-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent') || 'unknown',
  }, 'Incoming request');
  next();
});

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/google-drive', googleDriveRoutes);

// Health check endpoints at multiple paths for diagnostics
// Standard API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Root health check for direct access
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// NOTE: This is only for development testing - should be removed in production
if (config.nodeEnv === 'development') {
  // Basic health check with explicit headers for diagnostic purposes
  app.get('/rawhealth', (req, res) => {
    // Manually set CORS headers for diagnostic purposes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'text/plain');
    res.send('Backend is healthy');
  });
  
  // Special diagnostics endpoint with no middleware
  app.get('/api/test-cors', (req, res) => {
    // Log diagnostic info
    console.log('Received test-cors request:', {
      headers: req.headers,
      origin: req.get('origin'),
      method: req.method
    });
    
    // Return CORS diagnostics
    res.json({ 
      success: true, 
      message: 'CORS test successful',
      headers: {
        origin: req.get('origin'),
        host: req.get('host')
      }
    });
  });
}

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.path}' was not found on this server.`,
  });
});

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({
    err,
    method: req.method,
    url: req.url,
    body: req.body,
  }, 'Error processing request');
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
});

// Start server
app.listen(port, config.host, () => {
  logger.info(`Server running on ${config.host}:${port} in ${config.nodeEnv} mode`);
  logger.info(`Health check available at http://${config.host}:${port}/api/health`);
});