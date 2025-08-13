"use client"
import * as React from "react"
import { FieldError, UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"

export function Form({ children, className }: { children: React.ReactNode; className?: string }) {
  return <form className={cn("grid gap-4", className)}>{children}</form>
}

export function FormField({
  label,
  error,
  children,
}: {
  label?: React.ReactNode
  error?: FieldError
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      {label ? <label className="text-sm text-slate-700">{label}</label> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error.message}</p> : null}
    </div>
  )
}

export function FormActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex justify-end gap-2">{children}</div>
}

export type RHF = UseFormReturn<any>

