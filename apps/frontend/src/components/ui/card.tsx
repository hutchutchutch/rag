import React from 'react';
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: '0' | '1' | '2' | '3' | '4';
}

export const Card = ({ className = '', elevation = '1', ...props }: CardProps) => (
  <div 
    className={cn(
      "rounded-lg border border-dark-600 bg-dark-800 transition-all", 
      {
        "": elevation === '0', // No shadow
        "elevation-1 shadow-sm": elevation === '1',
        "elevation-2 shadow-md": elevation === '2',
        "elevation-3 shadow-lg": elevation === '3',
        "elevation-4 shadow-xl": elevation === '4',
      },
      className
    )} 
    {...props} 
  />
);

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-b border-dark-600", className)} {...props} />
);

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold text-dark-50", className)} {...props} />
);

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-dark-300", className)} {...props} />
);

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props} />
);

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-t border-dark-600", className)} {...props} />
);