import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Variant = "default" | "blue" | "amber" | "emerald" | "slate"

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  label: string
  variant?: Variant
  showDot?: boolean
}

export function StatusBadge({ label, variant = "slate", showDot = true, className, ...props }: Props) {
  const dotColor: Record<Variant, string> = {
    default: "bg-slate-400",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    slate: "bg-slate-500",
  }

  return (
    <Badge
      variant={variant}
      className={cn("gap-1.5 leading-5", className)}
      {...props}
    >
      {showDot ? <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[variant])} /> : null}
      <span>{label}</span>
    </Badge>
  )
}

