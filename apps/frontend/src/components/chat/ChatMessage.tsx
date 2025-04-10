import * as React from "react";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  className?: string;
}

export function ChatMessage({ message, isUser, timestamp, className }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      isUser ? "flex-row-reverse" : "flex-row",
      className
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isUser ? "bg-primary-500 text-dark-50" : "bg-secondary-500 text-dark-50"
      )}>
        <span className="text-xs">
          {isUser ? "You" : "AI"}
        </span>
      </Avatar>
      <Card className={cn(
        "max-w-[80%]",
        isUser ? "bg-primary-500/10" : "bg-secondary-500/10"
      )}>
        <CardContent className="p-3">
          <p className="text-sm leading-relaxed text-dark-50">{message}</p>
          {timestamp && (
            <time className="text-xs text-dark-300 mt-2 block">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          )}
        </CardContent>
      </Card>
    </div>
  );
}