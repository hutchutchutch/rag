import React, { useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { useRagPipeline } from '../hooks/use-rag-pipeline';
import { ChatMessage } from '../lib/rag';

const ChatFeed: React.FC = () => {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isChatting,
    chatHistory,
    sendMessage,
    clearChat
  } = useRagPipeline();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isChatting) return;
    
    try {
      const userMessage = message;
      setMessage('');
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.type === 'human') {
      return (
        <div key={index} className="bg-primary-900/30 rounded-lg p-4 max-w-[80%] self-end">
          <p className="text-gray-100">{msg.content}</p>
        </div>
      );
    } else if (msg.type === 'ai') {
      return (
        <div key={index} className="bg-dark-700 rounded-lg p-4 max-w-[80%] self-start">
          <p className="text-gray-100">{msg.content}</p>
        </div>
      );
    } else {
      return null; // Skip system messages in the UI
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-dark-800 border-x border-dark-600">
      <div className="p-4 border-b border-dark-600 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-dark-700 rounded-md text-gray-400 hover:text-white transition-colors"
          title="Clear chat history"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet. Ask a question to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chatHistory.map(renderMessage)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-6 border-t border-dark-600">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about the document..."
            className="chat-input"
            disabled={isChatting}
          />
          <button 
            type="submit" 
            className="btn-primary"
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