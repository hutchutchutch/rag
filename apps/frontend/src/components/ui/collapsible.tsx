import React from 'react';

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ 
  open, 
  onOpenChange, 
  children, 
  className = '' 
}) => (
  <div className={className}>
    {React.Children.map(children, child => 
      React.isValidElement(child) 
        ? React.cloneElement(child as React.ReactElement<any>, { 
            open, 
            onOpenChange 
          }) 
        : child
    )}
  </div>
);

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ 
  children, 
  className = '', 
  open, 
  onOpenChange 
}) => (
  <button 
    className={`w-full text-left ${className}`}
    onClick={() => onOpenChange?.(!open)}
  >
    {children}
  </button>
);

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ 
  open, 
  children, 
  className = '' 
}) => {
  if (!open) return null;
  return <div className={className}>{children}</div>;
};