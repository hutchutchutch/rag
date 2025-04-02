import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '' }) => (
  <div className={`bg-dark-700 rounded-full overflow-hidden ${className}`}>
    <div
      className="h-full bg-primary-600 transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);