import React from 'react';

export const Collapsible = ({ open, onOpenChange, children, className = '' }: any) => (
  <div className={className}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { open, onOpenChange })
    )}
  </div>
);

export const CollapsibleTrigger = ({ children, onClick, className = '' }: any) => (
  <button 
    className={`w-full text-left ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export const CollapsibleContent = ({ open, children, className = '' }: any) => {
  if (!open) return null;
  return <div className={className}>{children}</div>;
};