// Simple Express server for testing connectivity
import express from 'express';
import cors from 'cors';
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'standalone',
    timestamp: new Date().toISOString(),
    message: 'This is the standalone server for connectivity testing'
  });
});

// Root health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'standalone',
    timestamp: new Date().toISOString(),
    message: 'Root health check from standalone server'
  });
});

// Raw health for simple testing
app.get('/rawhealth', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');
  res.send('Standalone server is healthy!');
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test from standalone server successful',
    headers: {
      origin: req.get('origin') || 'no origin header',
      host: req.get('host') || 'no host header'
    }
  });
});

// Network info endpoint
app.get('/api/network-info', (req, res) => {
  res.json({
    remoteAddress: req.socket.remoteAddress,
    remotePort: req.socket.remotePort,
    headers: req.headers,
    url: req.url,
    method: req.method
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Standalone test server listening on port ${port}`);
  console.log(`Test URLs:
  - http://localhost:3000/api/health
  - http://localhost:3000/health
  - http://localhost:3000/rawhealth
  - http://localhost:3000/api/test-cors
  - http://localhost:3000/api/network-info`);
});