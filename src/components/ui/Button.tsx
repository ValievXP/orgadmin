import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-admin-primary-900)] text-[var(--color-white)] hover:bg-[#0F0F0F] focus-visible:ring-[var(--color-admin-primary-900)]",
        secondary:
          "bg-[var(--color-neutral-100)] text-[var(--text-strong)] hover:bg-[var(--color-neutral-200)] focus-visible:ring-[var(--color-neutral-200)]",
        outline:
          "border-2 border-[var(--border-strong)] bg-transparent text-[var(--text-strong)] hover:bg-[var(--bg-surface-hover)] focus-visible:ring-[var(--border-strong)]",
        ghost:
          "bg-transparent text-[var(--text-default)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-strong)] focus-visible:ring-[var(--border-default)]",
        destructive:
          "bg-[var(--color-error-500)] text-white hover:bg-[var(--color-error-600)] focus-visible:ring-[var(--color-error-500)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
