// Simple HTTP server to serve static files for testing
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 5173;

const server = http.createServer((req, res) => {
  // Get the URL path
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './public/test-api.html';
  } else if (filePath === './test') {
    filePath = './public/test-api.html';
  }

  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Set content type based on file extension
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };
  
  const contentType = contentTypeMap[extname] || 'text/plain';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Page not found
        console.log(`File not found: ${filePath}`);
        fs.readFile('./public/test-api.html', (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading test-api.html');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, () => {
  console.log(`Standalone client server running at http://localhost:${port}/`);
  console.log(`Access the test page at: http://localhost:${port}/test`);
});