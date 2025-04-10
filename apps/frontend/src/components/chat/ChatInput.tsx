import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Type a message...", className }: ChatInputProps) {
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-center gap-2 p-4", className)}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!message.trim() || isLoading}
        variant="default"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}