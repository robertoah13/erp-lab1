"use client"

// Styled wrapper around Radix Select following ShadCN UI patterns.
// - Works with react-hook-form (value flows via onValueChange)
// - Accessible and keyboard-friendly
// - Tailwind-only styling (no inline styles)

import * as React from "react"
import * as RSelect from "@radix-ui/react-select"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Re-export Root and Value to match ShadCN usage
export const Select = RSelect.Root
export const SelectValue = RSelect.Value

// Trigger: rounded border, h-9, white bg, subtle shadow, clear focus/hover
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof RSelect.Trigger>,
  React.ComponentPropsWithoutRef<typeof RSelect.Trigger>
>(({ className, children, "aria-label": ariaLabel, ...props }, ref) => {
  return (
    <RSelect.Trigger
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 text-left text-sm",
        "shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-950/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* If no children provided, render a Value so placeholder/selected text shows */}
      {children ?? <RSelect.Value />}
      <RSelect.Icon asChild>
        <ChevronDown className="ml-2 h-4 w-4 opacity-60" aria-hidden="true" />
      </RSelect.Icon>
    </RSelect.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

// Content: rendered in a portal, with smooth scroll and subtle shadow
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof RSelect.Content>,
  React.ComponentPropsWithoutRef<typeof RSelect.Content>
>(({ className, children, position = "popper", sideOffset = 6, ...props }, ref) => {
  return (
    <RSelect.Portal>
      <RSelect.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          className
        )}
        {...props}
      >
        <RSelect.Viewport className="scroll-smooth">{children}</RSelect.Viewport>
      </RSelect.Content>
    </RSelect.Portal>
  )
})
SelectContent.displayName = "SelectContent"

// Item: keyboard selection support via ItemText, visual highlight, indicator
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof RSelect.Item>,
  React.ComponentPropsWithoutRef<typeof RSelect.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RSelect.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm",
        "outline-none focus:bg-slate-100 data-[highlighted]:bg-slate-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {/* Indicator appears for the selected item */}
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RSelect.ItemIndicator>
          <Check className="h-4 w-4" aria-hidden="true" />
        </RSelect.ItemIndicator>
      </span>
      <RSelect.ItemText>{children}</RSelect.ItemText>
    </RSelect.Item>
  )
})
SelectItem.displayName = "SelectItem"

// Notes for usage (kept as comments for clarity):
// <Select value={field.value} onValueChange={field.onChange}>
//   <SelectTrigger aria-label="Status">
//     <SelectValue placeholder="Selecione..." />
//   </SelectTrigger>
//   <SelectContent>
//     <SelectItem value="draft">Rascunho</SelectItem>
//     <SelectItem value="published">Publicado</SelectItem>
//   </SelectContent>
// </Select>
