import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useBookContext } from "@/contexts/book-context";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Type a message...", className }: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const { selectedBook, setSelectedBook } = useBookContext();
  
  // Mock documents for demo purposes
  const documents = [
    { id: 'doc1', title: 'Sample Document 1', path: '/docs/sample1' },
    { id: 'doc2', title: 'Machine Learning Guide', path: '/docs/ml-guide' },
    { id: 'doc3', title: 'Vector Database Guide', path: '/docs/vector-db' }
  ];
  
  const handleSelectDocument = (value: string) => {
    const selected = documents.find(doc => doc.id === value) || null;
    setSelectedBook(selected);
  };

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
        disabled={!message.trim() || isLoading || !selectedBook}
        variant="default"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
      <Select value={selectedBook?.id || ""} onValueChange={handleSelectDocument}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a document" />
        </SelectTrigger>
        <SelectContent>
          {documents.map(doc => (
            <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}