import * as React from "react"
import { cn } from "@/lib/utils"

export function TableToolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b bg-white px-3 py-2 text-sm",
        className
      )}
      {...props}
    />
  )
}

export function TableToolbarLeft({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}

export function TableToolbarRight({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ml-auto flex items-center gap-2", className)} {...props} />
}

type TableEmptyProps = React.HTMLAttributes<HTMLTableCellElement> & {
  colSpan: number
  message?: string
}

export function TableEmpty({ colSpan, message = "Nenhum registro encontrado", className, ...props }: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn(
          "p-6 text-center text-sm text-slate-500",
          className
        )}
        {...props}
      >
        {message}
      </td>
    </tr>
  )
}

type TableLoadingProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  rows?: number
  cols: number
}

export function TableLoading({ rows = 3, cols, className, ...props }: TableLoadingProps) {
  return (
    <tbody className={cn(className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="p-3">
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

