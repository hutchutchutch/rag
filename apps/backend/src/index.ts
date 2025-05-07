import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';
import knowledgeGraphRoutes from './routes/knowledgeGraph.routes.js';
import config from './config/index.js';
import logger from './utils/logger.js';
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
    body: req.method === 'POST' ? req.body : undefined, 
    query: req.query,
    params: req.params
  }, 'Incoming request');
  next();
});

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/graph', knowledgeGraphRoutes);

// Health check endpoints at multiple paths for diagnostics
// Standard API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Root health check for direct access
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Development-specific routes when needed
if (config.nodeEnv === 'development') {
  // Basic health check in plain text format
  app.get('/rawhealth', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('Backend is healthy');
  });
}

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
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
    success: false,
    error: message,
    status: statusCode
  });
});

// Start server
app.listen(Number(port), config.host, () => {
  logger.info(`Server running on ${config.host}:${port} in ${config.nodeEnv} mode`);
  logger.info(`Health check available at http://${config.host}:${port}/api/health`);
});