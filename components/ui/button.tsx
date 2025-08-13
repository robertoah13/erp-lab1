import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-primary text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed",
      secondary:
        "bg-secondary text-slate-900 hover:bg-slate-200 disabled:bg-slate-100",
      ghost: "bg-transparent hover:bg-slate-100",
      destructive:
        "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed",
    }
    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-5",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-transparent font-medium transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

