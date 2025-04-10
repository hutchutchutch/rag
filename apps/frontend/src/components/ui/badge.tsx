import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-dark-700 text-dark-100",
        primary: "bg-primary-500/20 text-primary-400",
        secondary: "bg-secondary-500/20 text-secondary-400",
        success: "bg-success-500/20 text-success-400",
        destructive: "bg-error-500/20 text-error-400",
        outline: "border border-dark-600 text-dark-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}