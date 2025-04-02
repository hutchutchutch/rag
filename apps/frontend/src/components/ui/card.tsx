import React from 'react';

export const Card = ({ className = '', ...props }: any) => (
  <div className={`rounded-lg border border-dark-600 ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }: any) => (
  <div className={`p-6 ${className}`} {...props} />
);