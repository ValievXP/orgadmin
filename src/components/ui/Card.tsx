import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'elevated' | 'flat' | 'interactive' }>(
  ({ className, variant = 'elevated', ...props }, ref) => {
    
    let variantStyles = "";
    if (variant === 'elevated') {
      variantStyles = "bg-[var(--bg-surface)] shadow-md border border-[var(--border-subtle)]";
    } else if (variant === 'flat') {
      variantStyles = "bg-[var(--bg-surface)] border border-[var(--border-default)]";
    } else if (variant === 'interactive') {
      variantStyles = "bg-[var(--bg-surface)] border border-[var(--border-default)] hover:shadow-lg hover:border-[var(--border-strong)] transition-all cursor-pointer";
    }

    return (
      <div
        ref={ref}
        className={cn("rounded-xl text-[var(--text-default)]", variantStyles, className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
