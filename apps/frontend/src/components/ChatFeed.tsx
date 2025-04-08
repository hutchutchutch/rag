import React, { useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { useRagPipeline } from '@hooks/use-rag-pipeline';
import { ChatMessage } from '@lib/rag';

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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="text-lg font-semibold text-dark-50">Chat</h2>
        <button 
          onClick={clearChat}
          className="btn btn-icon"
          title="Clear chat history"
        >
          <RefreshCw size={18} />
        </button>
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
      </div>
      
      <div className="chat-input-container">
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