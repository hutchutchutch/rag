import React from 'react';
import { BookProvider } from '@/contexts/book-context';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import VectorStorePanel from '@/components/VectorStorePanel';
import GraphPanel from '@/components/GraphPanel';

function App() {
  return (
    <BookProvider>
      <div className="flex w-full min-h-screen bg-[#141414]">
        <Sidebar position="left" title="Vector Store">
          <VectorStorePanel />
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-200">RAG Explorer</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-[#252525] text-gray-200 rounded-lg hover:bg-[#303030] transition-colors">
                Upload Book
              </button>
              
              <div className="flex items-center gap-2 text-gray-400">
                <span>Current Book:</span>
                <span className="text-gray-600">No books available</span>
              </div>
            </div>
          </div>
          
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