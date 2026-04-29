import * as React from "react"
import { cn } from "@/utils/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary text-on-primary": variant === "default",
          "bg-secondary-container text-on-secondary-container": variant === "secondary",
          "bg-secondary text-on-secondary": variant === "success",
          "bg-tertiary-container text-tertiary": variant === "warning",
          "bg-error text-on-error": variant === "danger",
          "border border-outline text-on-surface": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
