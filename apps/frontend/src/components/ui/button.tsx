import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "btn inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-dark-800 text-dark-50 hover:bg-dark-700": variant === "default",
            "bg-primary-500 text-white hover:bg-primary-600 shadow-glow-sm": variant === "primary",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "border border-dark-700 bg-dark-900 hover:bg-dark-800 text-dark-50": variant === "outline",
            "bg-dark-600 text-dark-50 hover:bg-dark-700": variant === "secondary",
            "hover:bg-dark-800 text-dark-300 hover:text-dark-50": variant === "ghost",
            "text-primary-500 hover:text-primary-600 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10 p-2 rounded-lg": size === "icon",
            "h-8 w-8 p-1.5 rounded-md": size === "icon-sm",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };