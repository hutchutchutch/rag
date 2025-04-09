// Simple HTTP server for client testing
const http = require('http');
const fs = require('fs');
const port = 5173;

// HTML content with embedded test script
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>API Connection Test</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    .success { background-color: #dff0d8; }
    .error { background-color: #f2dede; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Direct API Connection Test</h1>
  <p>This is a simple test page to verify direct API connectivity.</p>
  
  <div id="results"></div>
  
  <button id="testButton">Test API Connection</button>
  
  <script>
    const resultsDiv = document.getElementById('results');
    const testButton = document.getElementById('testButton');
    
    // Endpoints to test
    const endpoints = [
      { url: 'http://localhost:3000/api/health', name: 'API Health' },
      { url: 'http://localhost:3000/health', name: 'Root Health' },
      { url: 'http://localhost:3000/rawhealth', name: 'Raw Health' },
      { url: 'http://localhost:3000/api/test-cors', name: 'CORS Test' },
      { url: 'http://localhost:3000/api/network-info', name: 'Network Info' }
    ];
    
    // Test function
    async function testEndpoints() {
      resultsDiv.innerHTML = '<p>Testing...</p>';
      
      let resultsHtml = '';
      
      for (const endpoint of endpoints) {
        try {
          const start = Date.now();
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*'
            }
          });
          const elapsed = Date.now() - start;
          
          const contentType = response.headers.get('content-type');
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
          
          resultsHtml += \`
            <div class="result success">
              <h3>\${endpoint.name} - Success (\${elapsed}ms)</h3>
              <p>URL: \${endpoint.url}</p>
              <p>Status: \${response.status}</p>
              <pre>\${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}</pre>
            </div>
          \`;
        } catch (error) {
          resultsHtml += \`
            <div class="result error">
              <h3>\${endpoint.name} - Error</h3>
              <p>URL: \${endpoint.url}</p>
              <pre>\${error.toString()}</pre>
            </div>
          \`;
        }
      }
      
      resultsDiv.innerHTML = resultsHtml;
    }
    
    // Attach event listener
    testButton.addEventListener('click', testEndpoints);
    
    // Auto-test on load
    window.addEventListener('load', testEndpoints);
  </script>
</body>
</html>
`;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
});

// Start the server
server.listen(port, () => {
  console.log(`Simple client server running at http://localhost:${port}/`);
});