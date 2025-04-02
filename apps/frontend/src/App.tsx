import React from 'react';
import { BookProvider } from './contexts/book-context';
import Sidebar from './components/Sidebar';
import ChatFeed from './components/ChatFeed';
import VectorStorePanel from './components/VectorStorePanel';
import GraphPanel from './components/GraphPanel';

function App() {
  return (
    <BookProvider>
      <div className="flex w-full min-h-screen bg-dark-900">
        <Sidebar position="left" title="Vector Store">
          <VectorStorePanel />
        </Sidebar>
        
        <ChatFeed />
        
        <Sidebar position="right" title="Knowledge Graph">
          <GraphPanel />
        </Sidebar>
      </div>
    </BookProvider>
  );
}

export default App;