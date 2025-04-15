import * as React from "react";
import { cn } from "../../lib/utils";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "../ui/scroll-area";
import { useRagPipeline } from "../../hooks/use-rag-pipeline";

interface ChatFeedProps {
  className?: string;
}

export function ChatFeed({ className }: ChatFeedProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const {
    isChatting,
    chatHistory,
    sendMessage,
    clearChat
  } = useRagPipeline();

  // Auto-scroll when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Convert chat history to message format
  const messages = React.useMemo(() => {
    return chatHistory
      .filter(msg => msg.type !== "system")
      .map((msg, index) => ({
        id: `msg-${index}`,
        content: msg.content,
        isUser: msg.type === "human",
        timestamp: new Date().toISOString()
      }));
  }, [chatHistory]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b border-dark-700 p-4">
        <h2 className="text-lg font-semibold text-dark-50">Chat</h2>
        <Button 
          onClick={clearChat}
          variant="outline"
          size="icon"
          title="Clear chat history"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Clear chat</span>
        </Button>
      </div>
      
      <div className="relative flex-1">
        <ScrollArea className="h-full flex flex-col justify-end" viewportRef={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-end p-8 text-dark-400">
              <p>No messages yet. Ask a question to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4 mt-auto w-full max-w-[800px] mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isChatting && (
                <div className="flex items-center p-4">
                  <div className="animate-pulse text-dark-300">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="border-t border-dark-700 sticky bottom-0 bg-dark-800 flex justify-center">
        <ChatInput
          onSend={sendMessage}
          isLoading={isChatting}
          placeholder="Ask a question about the document..."
        />
      </div>
    </div>
  );
}