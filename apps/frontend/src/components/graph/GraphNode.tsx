import * as React from "react";
import { cn } from "@lib/utils";
import { Card } from "@ui/card";

interface GraphNodeProps {
  id: string;
  title: string;
  selected?: boolean;
  similarity?: number;
  onClick?: () => void;
  className?: string;
}

export function GraphNode({ 
  id, 
  title, 
  selected = false, 
  similarity = 0, 
  onClick, 
  className 
}: GraphNodeProps) {
  const nodeSize = Math.max(36, Math.min(64, 36 + similarity * 28));
  
  return (
    <Card
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-full p-0 transition-all duration-300 hover:shadow-primary-glow",
        selected ? "border-primary-500 bg-primary-500/20 shadow-primary-glow" : "border-dark-700 bg-dark-800",
        className
      )}
      style={{
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
      }}
      onClick={onClick}
    >
      <span className={cn(
        "truncate text-center text-xs",
        selected ? "text-primary-100" : "text-dark-300"
      )}>
        {title}
      </span>
    </Card>
  );
}