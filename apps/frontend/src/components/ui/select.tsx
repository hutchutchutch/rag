import React from 'react';

export const Select = ({ children, value, onValueChange }: any) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {children}
    </select>
  );
};

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

export const SelectItem = ({ children, value }: any) => (
  <option value={value}>{children}</option>
);

export const SelectValue = ({ placeholder }: any) => (
  <span className="text-gray-400">{placeholder}</span>
);