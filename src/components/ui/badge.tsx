import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]/90",
        warning:
          "border-transparent bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90",
        outline: "text-foreground border-border",
        // LINEAR-STYLE VARIANTS
        subtle:
          "border border-[hsl(var(--linear-border))] bg-transparent text-[hsl(var(--linear-text-secondary))] font-normal",
        dot:
          "border-0 bg-transparent px-0 py-0 gap-1.5 text-[hsl(var(--linear-text-secondary))] font-normal",
        ghost:
          "border-0 bg-[hsl(var(--linear-bg))] text-[hsl(var(--linear-text-secondary))] hover:bg-[hsl(var(--linear-bg-hover))] font-normal",
        accent:
          "border-0 bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent-primary))] font-medium",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-[10px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, size, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {variant === "dot" && (
        <span 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
          style={{ backgroundColor: dotColor || 'currentColor' }}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }