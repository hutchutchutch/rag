import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CollapsibleSectionProps } from "./types";

export function CollapsibleSection({
  title,
  sectionKey,
  isOpen,
  onToggle,
  completedOptions,
  optionsCount,
  children
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(sectionKey)}
      className="border border-gray-700 rounded-md overflow-hidden"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between bg-[#303030] p-3 text-left">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <span className={`ml-2 text-xs ${completedOptions > 0 ? 'text-primary-400' : 'text-gray-400'}`}>
            {completedOptions}/{optionsCount} selected
          </span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-[#252525]">
        <div className="p-3 space-y-3 w-full">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
