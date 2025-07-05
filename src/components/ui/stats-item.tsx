import * as React from "react"
import { cn } from "@/lib/utils"

interface StatsItemProps {
  number: string
  label: string
  className?: string
}

const StatsItem = React.forwardRef<
  HTMLDivElement,
  StatsItemProps
>(({ number, label, className }, ref) => (
  <div 
    className={cn("text-center", className)}
    ref={ref}
  >
    <div className="text-[2.5rem] font-bold text-[hsl(var(--color-primary))] mb-2 leading-none">
      {number}
    </div>
    <div className="text-sm text-[hsl(var(--color-text-muted))] font-medium">
      {label}
    </div>
  </div>
))
StatsItem.displayName = "StatsItem"

export { StatsItem }