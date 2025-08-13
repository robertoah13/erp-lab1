"use client"

import * as React from "react"
import * as Toast from "@radix-ui/react-toast"

export function Toaster() {
  return (
    <Toast.Provider swipeDirection="right" duration={3000}>
      <Toast.Viewport className="fixed bottom-0 right-0 z-[100] m-4 w-96 max-w-[100vw] outline-none" />
    </Toast.Provider>
  )
}

export function useSimpleToast() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState<string>("")
  const [description, setDescription] = React.useState<string | undefined>(undefined)

  const show = React.useCallback((t: string, d?: string) => {
    setTitle(t)
    setDescription(d)
    setOpen(false)
    setTimeout(() => setOpen(true), 0)
  }, [])

  const node = (
    <Toast.Root open={open} onOpenChange={setOpen} className="bg-white border rounded-md shadow p-3 grid gap-2">
      {title ? <Toast.Title className="font-medium text-slate-900">{title}</Toast.Title> : null}
      {description ? (
        <Toast.Description className="text-sm text-slate-600">{description}</Toast.Description>
      ) : null}
    </Toast.Root>
  )

  return { show, node }
}
