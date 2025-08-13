"use client"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewOrderModal } from "./new-order-modal"
import { money, dateBR } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { useSimpleToast } from "@/components/ui/toaster"

type OrdemRow = {
  id: number
  codigo: string
  status: string
  valorTotal: number
  createdAt: string
  cliente: { nome: string }
  dentista: { nome: string }
  paciente: { nome: string }
  tipoPeca: { nome: string }
}

export default function Page() {
  const [status, setStatus] = React.useState<string | "todas">("todas")
  const [data, setData] = React.useState<OrdemRow[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  // KPIs state
  const [kpi, setKpi] = React.useState<null | { entrada: number; producao: number; finalizada: number; entregue: number }>(null)
  const [kpiLoading, setKpiLoading] = React.useState(true)
  const [kpiError, setKpiError] = React.useState<string | null>(null)
  const toast = useSimpleToast()

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = status && status !== "todas" ? `?status=${encodeURIComponent(status)}` : ""
      const res = await fetch(`/api/ordens${qs}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }, [status])

  React.useEffect(() => {
    load()
  }, [load, reloadKey])

  // Separate effect to load KPIs
  const loadKpis = React.useCallback(async () => {
    setKpiLoading(true)
    setKpiError(null)
    try {
      const res = await fetch(`/api/kpis/ordens`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json: { byStatus: { entrada: number; producao: number; finalizada: number; entregue: number } } = await res.json()
      setKpi(json.byStatus)
    } catch (e: any) {
      setKpiError(e?.message ?? "Falha ao carregar KPIs")
    } finally {
      setKpiLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadKpis()
  }, [loadKpis, reloadKey])

  async function handleDelete(id: number) {
    if (!window.confirm("Deseja excluir esta ordem?")) return
    try {
      const r = await fetch(`/api/ordens/${id}`, { method: "DELETE", cache: "no-store" })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || j?.ok !== true) throw new Error(j?.error ?? "Erro ao excluir")
      setReloadKey((k) => k + 1)
      loadKpis()
      toast.show("Ordem excluída")
    } catch (e: any) {
      toast.show("Falha ao excluir", e?.message)
    }
  }

  return (
    <div className="space-y-4">
      {toast.node}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ordens</h1>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v as any); setReloadKey((k)=>k+1) }}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="entrada">entrada</SelectItem>
              <SelectItem value="producao">producao</SelectItem>
              <SelectItem value="finalizada">finalizada</SelectItem>
              <SelectItem value="entregue">entregue</SelectItem>
            </SelectContent>
          </Select>
          <NewOrderModal mode="create" onCreated={() => { setReloadKey((k) => k + 1); loadKpis(); }} />
        </div>
      </div>

      {/* KPIs summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiLoading ? (
          <p className="col-span-4 text-slate-500">Carregando KPIs...</p>
        ) : kpiError ? (
          <p className="col-span-4 text-slate-500">Não foi possível carregar KPIs.</p>
        ) : kpi ? (
          <>
            <MiniKpi label="Entrada" value={kpi.entrada} />
            <MiniKpi label="Produção" value={kpi.producao} />
            <MiniKpi label="Finalizada" value={kpi.finalizada} />
            <MiniKpi label="Entregue" value={kpi.entregue} />
          </>
        ) : null}
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.codigo}</TableCell>
                    <TableCell>{o.cliente?.nome}</TableCell>
                    <TableCell>{o.dentista?.nome}</TableCell>
                    <TableCell>{o.paciente?.nome}</TableCell>
                    <TableCell>{o.tipoPeca?.nome}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    </TableCell>
                    <TableCell>{money(o.valorTotal ?? 0)}</TableCell>
                    <TableCell>{dateBR(o.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <RowActions
                        ordem={o}
                        onEditDone={() => { setReloadKey((k)=>k+1); loadKpis() }}
                        onDelete={() => handleDelete(o.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-500">
                     Nenhuma ordem encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function statusVariant(status: string): "blue" | "amber" | "emerald" | "slate" | "default" {
  switch (status) {
    case "entrada":
      return "blue"
    case "producao":
      return "amber"
    case "finalizada":
      return "emerald"
    case "entregue":
      return "slate"
    default:
      return "default"
  }
}

function RowActions({ ordem, onEditDone, onDelete }: { ordem: OrdemRow & { clienteId?: number; dentistaId?: number; pacienteId?: number; tipoPecaId?: number }; onEditDone: () => void; onDelete: () => void }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <Button size="sm" variant="ghost" aria-label="Ações" onClick={() => setOpen(v => !v)}>
        ⋯
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-28 rounded-md border bg-white p-1 shadow-md">
          <NewOrderModal
            order={{ ...ordem, clienteId: (ordem as any).clienteId, dentistaId: (ordem as any).dentistaId, pacienteId: (ordem as any).pacienteId, tipoPecaId: (ordem as any).tipoPecaId }}
            mode="edit"
            onUpdated={() => { setOpen(false); onEditDone() }}
          >
            <button className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-slate-100" onClick={() => setOpen(false)}>Editar</button>
          </NewOrderModal>
          <button className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => { setOpen(false); onDelete() }}>Excluir</button>
        </div>
      ) : null}
    </div>
  )
}

function MiniKpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-card text-card-foreground shadow p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
