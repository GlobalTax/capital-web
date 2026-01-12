import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    density: {
      default: "",
      compact: "[&_th]:h-9 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3 text-[13px]",
      comfortable: "[&_th]:h-14 [&_th]:px-5 [&_td]:py-4 [&_td]:px-5",
    },
    variant: {
      default: "",
      linear: "[&_tr]:border-b-0 [&_tr]:border-b [&_tr]:border-[hsl(var(--linear-border-subtle))] [&_th]:text-[hsl(var(--linear-text-tertiary))] [&_th]:font-normal [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-wider",
    }
  },
  defaultVariants: {
    density: "default",
    variant: "default",
  }
})

interface TableProps extends React.HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density, variant, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ density, variant }), className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-normal [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const tableRowVariants = cva(
  "border-b transition-colors data-[state=selected]:bg-muted",
  {
    variants: {
      variant: {
        default: "hover:bg-muted/50",
        linear: "hover:bg-[hsl(var(--linear-bg-hover))] data-[state=selected]:border-l-2 data-[state=selected]:border-l-[hsl(var(--accent-primary))] data-[state=selected]:bg-[hsl(var(--accent-soft))]",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
)

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement>, VariantProps<typeof tableRowVariants> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(tableRowVariants({ variant }), className)}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle font-normal text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("py-2.5 px-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
