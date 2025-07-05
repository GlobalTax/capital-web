import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonPrimary = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    className={cn(
      "bg-[hsl(var(--color-accent))] text-white hover:bg-[hsl(var(--color-accent-hover))] rounded-[8px] px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out shadow-[0_1px_3px_0_hsl(var(--color-text)/0.1)] hover:shadow-[0_4px_6px_-1px_hsl(var(--color-text)/0.1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </button>
))
ButtonPrimary.displayName = "ButtonPrimary"

export { ButtonPrimary }