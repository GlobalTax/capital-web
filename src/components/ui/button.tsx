import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-[hsl(var(--primary-hover))]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-sm)] hover:bg-destructive/90",
        outline:
          "border border-[hsl(var(--linear-border))] bg-background hover:bg-[hsl(var(--linear-bg-hover))]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-[hsl(var(--linear-bg-hover))]",
        link: "text-[hsl(var(--accent-primary))] underline-offset-4 hover:underline",
        // LINEAR-STYLE VARIANT
        linear: "bg-transparent border border-[hsl(var(--linear-border))] text-[hsl(var(--linear-text-primary))] hover:bg-[hsl(var(--linear-bg-hover))] hover:border-[hsl(var(--linear-border))]",
        accent: "bg-[hsl(var(--accent-primary))] text-white hover:bg-[hsl(var(--accent-hover))] shadow-[var(--shadow-sm)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-10 rounded-[var(--radius-lg)] px-6",
        icon: "h-9 w-9",
        xs: "h-7 rounded-[var(--radius-sm)] px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
