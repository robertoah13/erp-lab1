import * as React from "react"
import Link from "next/link"
import type { LinkProps } from "next/link"
import { cn } from "@/lib/utils"

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm text-slate-600", className)}
      {...props}
    />
  )
}

export function BreadcrumbList({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  return <ol className={cn("flex items-center gap-2", className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center gap-2", className)} {...props} />
}

export function BreadcrumbSeparator({ className, children = "/", ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-slate-300", className)} role="presentation" {...props}>
      {children}
    </span>
  )
}

interface BreadcrumbLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    LinkProps {
  className?: string
  children: React.ReactNode
}

export function BreadcrumbLink({ className, children, ...props }: BreadcrumbLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "text-slate-700 hover:text-slate-900 hover:underline underline-offset-4",
        className
      )}
    >
      {children}
    </Link>
  )
}

export function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-current="page"
      className={cn("font-medium text-slate-900", className)}
      {...props}
    />
  )
}

