import React from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatFeed: React.FC = () => {
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    // TODO: Implement chat submission
    setTimeout(() => {
      setLoading(false);
      setMessage('');
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-dark-800 border-x border-dark-600">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Example messages */}
        <div className="flex flex-col gap-2">
          <div className="bg-dark-700 rounded-lg p-4 max-w-[80%] self-start">
            <p className="text-gray-100">How can I help you today?</p>
          </div>
          <div className="bg-primary-900/30 rounded-lg p-4 max-w-[80%] self-end">
            <p className="text-gray-100">I'd like to learn about RAG applications.</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-dark-600">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !message.trim()}
          >
            {loading ? (
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