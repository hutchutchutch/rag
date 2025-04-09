// Simple HTTP server for testing connectivity
const http = require('http');
const url = require('url');
const port = 3000;

const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Set the response headers
  res.setHeader('Content-Type', 'application/json');
  
  // Define the response based on the path
  if (path === '/api/health' || path === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      version: '1.0.0',
      environment: 'simple-server',
      timestamp: new Date().toISOString(),
    }));
  } else if (path === '/rawhealth') {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end('Simple server is healthy!');
  } else if (path === '/api/test-cors') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'CORS test successful',
      headers: {
        origin: req.headers.origin || 'no origin header',
        host: req.headers.host || 'no host header'
      }
    }));
  } else if (path === '/api/network-info') {
    res.writeHead(200);
    res.end(JSON.stringify({
      remoteAddress: req.socket.remoteAddress,
      remotePort: req.socket.remotePort,
      headers: req.headers,
      url: req.url,
      method: req.method
    }));
  } else {
    // Return 404 for all other paths
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Not found',
      message: `The path ${path} was not found`
    }));
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Simple test server running at http://localhost:${port}/`);
  console.log(`Test URLs:
  - http://localhost:${port}/api/health
  - http://localhost:${port}/health
  - http://localhost:${port}/rawhealth
  - http://localhost:${port}/api/test-cors
  - http://localhost:${port}/api/network-info`);
});