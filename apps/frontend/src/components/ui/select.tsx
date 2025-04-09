import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const Select = ({ children, value, onValueChange, className = '' }: SelectProps) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className={`w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
    >
      {children}
    </select>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

export const SelectItem = ({ children, value }: SelectItemProps) => (
  <option value={value}>{children}</option>
);

// Keep these for backward compatibility but they're not used in the simplified version
export const SelectTrigger = ({ children, className = '', ...props }: any) => (
  <div className={`relative ${className}`} {...props}>
    {children}
  </div>
);

export const SelectContent = ({ children, className = '', ...props }: any) => (
  <div className={`mt-1 ${className}`} {...props}>
    {children}
  </div>
);

export const SelectValue = ({ placeholder }: any) => (
  <span className="text-gray-400">{placeholder}</span>
);
