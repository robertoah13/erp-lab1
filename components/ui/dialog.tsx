"use client"

import * as React from "react"
import * as RDialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export const Dialog = RDialog.Root
export const DialogTrigger = RDialog.Trigger

export function DialogContent(
  { className, ...props }: React.ComponentProps<typeof RDialog.Content>
) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 bg-black/20" />
      <RDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2",
          "rounded-md border bg-white p-4 shadow-lg focus:outline-none",
          className
        )}
        {...props}
      />
    </RDialog.Portal>
  )
}

export function DialogHeader(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={cn("mb-2", className)} {...props} />
}

export function DialogFooter(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
}

export const DialogTitle = RDialog.Title
export const DialogDescription = RDialog.Description

