import * as React from "react"
import { cn } from "@/lib/utils"

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  // Typography defaults for table content
  return <table className={cn("w-full caption-bottom text-sm leading-6", className)} {...props} />
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  // Sticky header with subtle separation
  return (
    <thead
      className={cn(
        "sticky top-0 z-10 bg-white [&_tr]:border-b shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  // Alternating rows and hover state
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-slate-50/50 odd:bg-slate-50/40",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  // Stronger header typography
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle font-semibold tracking-tight text-slate-700",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-3 align-middle text-slate-900", className)} {...props} />
}
