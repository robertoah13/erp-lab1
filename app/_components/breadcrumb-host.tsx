"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type Crumb = { label: string; href?: string }

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function toTitle(s: string): string {
  const words = s.replace(/-/g, " ").split(/\s+/).filter(Boolean)
  return words.map(capitalize).join(" ")
}

export function BreadcrumbHost() {
  const pathname = usePathname() ?? "/"
  const segments = pathname.split("/").filter(Boolean)

  const items: Crumb[] = []

  if (segments.length === 0) {
    items.push({ label: "Dashboard" })
  } else {
    items.push({ label: "Dashboard", href: "/" })
    const acc: string[] = []
    segments.forEach((seg, idx) => {
      acc.push(seg)
      const label = toTitle(decodeURIComponent(seg))
      const isLast = idx === segments.length - 1
      if (isLast) {
        items.push({ label })
      } else {
        items.push({ label, href: `/${acc.join("/")}` })
      }
    })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

