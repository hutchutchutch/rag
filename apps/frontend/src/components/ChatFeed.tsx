import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, RefreshCw, Database, Network } from 'lucide-react';
import { useRagPipeline } from '@hooks/use-rag-pipeline';
import { ChatMessage } from '@lib/rag';
import KnowledgeGraphEditor from '@/components/graph/KnowledgeGraphEditor';

const ChatFeed: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showRetrievedChunks, setShowRetrievedChunks] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isChatting,
    isSearching,
    chatHistory,
    searchResults,
    knowledgeGraph,
    sendMessage,
    clearChat,
    search
  } = useRagPipeline();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle search with knowledge graph building
  const handleSearch = async (buildKg: boolean = false) => {
    if (!message.trim() || isSearching) return;
    
    try {
      const searchQuery = message;
      // Keep the message in the input
      await search(searchQuery, 5, buildKg);
      
      if (buildKg) {
        setShowGraph(true);
      } else {
        setShowRetrievedChunks(true);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isChatting) return;

    const userMessage = message;
    try {
      setMessage('');
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add test message to show mock functionality is working
      const mockResponse = { 
        type: 'ai', 
        content: '[Mock Response] I\'m using the mock service because the backend services are in mock mode. Your query was: ' + userMessage 
      };
      // Need to cast to any for TypeScript
      (window as any).mockChatResponse = mockResponse;
      alert('Using mock service. Check console for details.');
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.type === 'human') {
      return (
        <div key={index} className="chat-message-user">
          <p className="text-dark-50">{msg.content}</p>
        </div>
      );
    } else if (msg.type === 'ai') {
      return (
        <div key={index} className="chat-message-ai">
          <p className="text-dark-50">{msg.content}</p>
        </div>
      );
    } else {
      return null; // Skip system messages in the UI
    }
  };

  // Render retrieved chunks
  const renderChunks = () => {
    if (!searchResults || searchResults.length === 0) {
      return <p className="text-dark-400">No results found.</p>;
    }

    return (
      <div className="retrieved-chunks">
        <h3 className="text-md font-semibold text-dark-50 mb-2">Retrieved Chunks</h3>
        <div className="flex flex-col gap-2">
          {searchResults.map((chunk, index) => (
            <div key={index} className="bg-dark-800 p-3 rounded-md text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-primary-400">
                  {chunk.metadata?.title || 'Untitled'} 
                  {chunk.metadata?.sectionTitle ? ` - ${chunk.metadata.sectionTitle}` : ''}
                </span>
                <span className="text-xs text-dark-400">
                  Score: {typeof (chunk as any).score === 'number' ? (chunk as any).score.toFixed(2) : 'N/A'}
                </span>
              </div>
              <p className="text-dark-200">{chunk.text.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
        <button 
          className="btn btn-sm btn-outline mt-2"
          onClick={() => setShowRetrievedChunks(false)}
        >
          Hide Results
        </button>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="text-lg font-semibold text-dark-50">Chat</h2>
        <div className="flex gap-2">
          <button 
            onClick={clearChat}
            className="btn btn-icon"
            title="Clear chat history"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-400">
            <p>No messages yet. Ask a question to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chatHistory.map(renderMessage)}
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {/* Conditional rendering for search results */}
        {showRetrievedChunks && (
          <div className="mt-4 bg-dark-750 p-4 rounded-md">
            {renderChunks()}
          </div>
        )}
        
        {/* Knowledge Graph Editor */}
        {showGraph && (
          <div className="mt-4 bg-dark-750 p-4 rounded-md">
            <KnowledgeGraphEditor onClose={() => setShowGraph(false)} />
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => handleSearch(false)}
            className="btn btn-sm btn-outline"
            disabled={!message.trim() || isSearching}
            title="Search for relevant documents"
          >
            <Database size={16} className="mr-1" />
            Retrieve Chunks
          </button>
          <button
            onClick={() => handleSearch(true)}
            className="btn btn-sm btn-outline"
            disabled={!message.trim() || isSearching}
            title="Build knowledge graph from documents"
          >
            <Network size={16} className="mr-1" />
            Extract Graph
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about the document..."
            className="input flex-1"
            disabled={isChatting}
          />
          <button 
            type="submit" 
            className="btn btn-primary glow-hover-primary"
            disabled={isChatting || !message.trim()}
          >
            {isChatting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatFeed;