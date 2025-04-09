import React, { useEffect, useState } from 'react';
import { BookProvider } from '@/contexts/book-context';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import VectorStorePanel from '@/components/VectorStorePanel';
import GraphPanel from '@/components/GraphPanel';

function App() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');
  
  useEffect(() => {
    // Test connection to backend
    const checkBackendConnection = async () => {
      try {
        // Read API URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const apiBase = apiUrl.replace(/\/api$/, '');
        
        console.log('Using API URL:', apiUrl);
        console.log('Using API base:', apiBase);
        
        // Try health endpoint via environment URL
        const healthUrl = `${apiUrl}/health`;
        const rootHealthUrl = `${apiBase}/health`;
        // Try API health endpoint (most likely to work)
        try {
          console.log('Attempting API health endpoint:', healthUrl);
          const apiResponse = await fetch(healthUrl, {
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
          });
          
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            setBackendStatus(`Connected to API (${data.environment} mode)`);
            console.log('Successfully connected to API health endpoint:', data);
            return;
          }
        } catch (apiErr) {
          console.error('API health endpoint error:', apiErr);
        }
        
        // Then try root health endpoint
        try {
          console.log('Attempting root health endpoint:', rootHealthUrl);
          const rootResponse = await fetch(rootHealthUrl, {
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
          });
          
          if (rootResponse.ok) {
            const data = await rootResponse.json();
            setBackendStatus(`Connected to root (${data.environment} mode)`);
            console.log('Successfully connected to root health endpoint:', data);
            return;
          }
        } catch (rootErr) {
          console.error('Root health endpoint error:', rootErr);
        }
        
        // Try the test-cors endpoint as fallback
        try {
          const testEndpoint = `${apiBase}/api/test-cors`;
          console.log('Attempting CORS test endpoint:', testEndpoint);
          
          const testResponse = await fetch(testEndpoint, {
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            setBackendStatus(`Connected via test-cors endpoint`);
            console.log('CORS test successful:', testData);
            return;
          } else {
            console.error('CORS test failed:', testResponse.status);
          }
        } catch (corsErr) {
          console.error('CORS test error:', corsErr);
        }
        
        // Try rawhealth as last resort
        try {
          const rawhealthUrl = `${apiBase}/rawhealth`;
          console.log('Attempting rawhealth endpoint:', rawhealthUrl);
          
          const rawhealthResponse = await fetch(rawhealthUrl);
          if (rawhealthResponse.ok) {
            setBackendStatus('Connected via rawhealth endpoint');
            return;
          }
        } catch (rawErr) {
          console.error('Rawhealth error:', rawErr);
        }
        
        setBackendStatus('Failed to connect to backend API');
      } catch (error) {
        console.error('Backend connection error:', error);
        setBackendStatus('Failed to connect to backend');
      }
    };
    
    checkBackendConnection();
  }, []);

  return (
    <BookProvider>
      <div className="flex w-full min-h-screen bg-dark-950">
        <Sidebar position="left" title="Vector Store">
          <VectorStorePanel />
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="panel-header h-16 elevation-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-dark-50">RAG Explorer</h1>
              <div className={`text-xs px-2 py-1 rounded ${backendStatus.includes('Connected') ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                {backendStatus}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="btn btn-primary glow-hover-primary">
                Upload Book
              </button>
              
              <div className="flex items-center gap-2 text-dark-300">
                <span>Current Book:</span>
                <span className="text-dark-400">No books available</span>
              </div>
            </div>
          </header>
          
          <ChatFeed />
        </div>
        
        <Sidebar position="right" title="Knowledge Graph">
          <GraphPanel />
        </Sidebar>
      </div>
    </BookProvider>
  );
}

export default App;