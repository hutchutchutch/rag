import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarItemProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SidebarItem({
  title,
  icon,
  children,
  defaultOpen = false,
  className,
}: SidebarItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full border-b border-dark-700", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between rounded-none p-4 hover:bg-dark-800"
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-dark-300">{icon}</span>}
            <span className="font-medium text-dark-100">{title}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-dark-300" />
          ) : (
            <ChevronRight className="h-4 w-4 text-dark-300" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}