import { ChatInputArea } from "@/components/ui/chat-input-area"

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  return (
    <ChatInputArea 
      onSend={onSend} 
      isLoading={isLoading}
      placeholder={placeholder}
    />
  );
}