import React from 'react';
import { BookProvider } from '@/contexts/book-context';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import VectorStorePanel from '@/components/VectorStorePanel';
import GraphPanel from '@/components/GraphPanel';

function App() {
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