"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useSimpleToast } from "@/components/ui/toaster"

const StatusUnion = z.enum(["entrada","producao","finalizada","entregue"])
const Schema = z.object({
  codigo: z.string().min(3),
  clienteId: z.coerce.number(),
  dentistaId: z.coerce.number(),
  pacienteId: z.coerce.number(),
  tipoPecaId: z.coerce.number(),
  status: StatusUnion.default("entrada"),
  dataPrevista: z.string().optional(),
  valorTotal: z.coerce.number().nonnegative().default(0),
  observacoes: z.string().optional()
})
type FormData = z.input<typeof Schema>
type Item = { id:number; nome:string }

async function getJson<T>(url:string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export function NewOrderModal({ order, mode, onCreated, onUpdated, children }: { order?: any; mode?: "create" | "edit"; onCreated?: () => void; onUpdated?: () => void; children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [clientes, setClientes] = React.useState<Item[]>([])
  const [dentistas, setDentistas] = React.useState<Item[]>([])
  const [pacientes, setPacientes] = React.useState<Item[]>([])
  const [tipos, setTipos] = React.useState<Item[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const f = useForm<FormData>({ resolver: zodResolver(Schema), defaultValues: { status: "entrada", valorTotal: 0 } })
  const toast = useSimpleToast()

  const effectiveMode: "create" | "edit" = mode ?? (order ? "edit" : "create")

  // Prefill when editing
  React.useEffect(() => {
    if (order) {
      f.reset({
        codigo: order.codigo,
        clienteId: order.clienteId,
        dentistaId: order.dentistaId,
        pacienteId: order.pacienteId,
        tipoPecaId: order.tipoPecaId,
        status: order.status,
        valorTotal: Number(order.valorTotal ?? 0),
        dataPrevista: order.dataPrevista ? new Date(order.dataPrevista).toISOString().slice(0, 10) : undefined,
        observacoes: order.observacoes ?? undefined,
      })
    }
  }, [order])

  React.useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const [c,d,p,t] = await Promise.all([
          getJson<Item[]>("/api/clientes"),
          getJson<Item[]>("/api/dentistas"),
          getJson<Item[]>("/api/pacientes"),
          getJson<Item[]>("/api/tipos"),
        ])
        setClientes(c); setDentistas(d); setPacientes(p); setTipos(t)
      } catch (e:any) {
        setError(e?.message ?? "Falha ao carregar listas")
      }
    })()
  }, [open])

  async function onSubmit(data: FormData) {
    setLoading(true); setError(null)
    try {
      const url = effectiveMode === "edit" && order ? `/api/ordens/${order.id}` : "/api/ordens"
      const method = effectiveMode === "edit" ? "PATCH" : "POST"
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dataPrevista: data.dataPrevista ? new Date(data.dataPrevista).toISOString() : undefined,
        }),
        cache: "no-store",
      })
      if (!r.ok) throw new Error((await r.json()).error ?? "Erro ao salvar")
      setOpen(false)
      if (effectiveMode === "edit") {
        onUpdated?.()
        toast.show("Ordem atualizada")
      } else {
        f.reset()
        onCreated?.()
        toast.show("Ordem criada")
      }
    } catch (e:any) {
      const msg = e?.message ?? "Erro ao salvar"
      setError(msg)
      toast.show("Falha ao salvar", msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          <span>{children}</span>
        ) : effectiveMode !== "edit" ? (
          <Button>Nova Ordem</Button>
        ) : (
          <span />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        {toast.node}
        <DialogHeader>
          <DialogTitle>{effectiveMode === "edit" ? "Editar Ordem" : "Nova Ordem"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={f.handleSubmit(onSubmit)}>
          <label>Código</label>
          <Input placeholder="ex: ORD-1024" {...f.register("codigo")} />

          <label>Cliente</label>
          <Select onValueChange={v => f.setValue("clienteId", Number(v))} value={f.watch("clienteId") ? String(f.watch("clienteId")) : undefined}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {clientes.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.nome}</SelectItem>)}
            </SelectContent>
          </Select>

          <label>Dentista</label>
          <Select onValueChange={v => f.setValue("dentistaId", Number(v))} value={f.watch("dentistaId") ? String(f.watch("dentistaId")) : undefined}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {dentistas.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.nome}</SelectItem>)}
            </SelectContent>
          </Select>

          <label>Paciente</label>
          <Select onValueChange={v => f.setValue("pacienteId", Number(v))} value={f.watch("pacienteId") ? String(f.watch("pacienteId")) : undefined}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {pacientes.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.nome}</SelectItem>)}
            </SelectContent>
          </Select>

          <label>Tipo de Peça</label>
          <Select onValueChange={v => f.setValue("tipoPecaId", Number(v))} value={f.watch("tipoPecaId") ? String(f.watch("tipoPecaId")) : undefined}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {tipos.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.nome}</SelectItem>)}
            </SelectContent>
          </Select>

          <label>Status</label>
          <Select value={f.watch("status") ?? "entrada"} onValueChange={v => f.setValue("status", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["entrada","producao","finalizada","entregue"].map(s =>
                <SelectItem key={s} value={s}>{s}</SelectItem>
              )}
            </SelectContent>
          </Select>

          <label>Valor (R$)</label>
          <Input type="number" step="0.01" {...f.register("valorTotal", { valueAsNumber: true })} />

          <label>Prevista (data)</label>
          <Input type="date" {...f.register("dataPrevista")} />

          <label>Observações</label>
          <Input placeholder="Opcional" {...f.register("observacoes")} />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}
