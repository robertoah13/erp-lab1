"use client"
import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { dateBR } from "@/lib/format"

type Ordem = {
  id: number
  codigo: string
  status: string
  dataPrevista: string | null
  cliente?: { nome: string } | null
  dentista?: { nome: string } | null
  paciente?: { nome: string } | null
  tipoPeca?: { nome: string } | null
}

function ymd(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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

export default function Page() {
  const [date, setDate] = React.useState<string>(() => ymd(new Date()))
  const [items, setItems] = React.useState<Ordem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/ordens?date=${encodeURIComponent(date)}` as string, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        const data: Ordem[] = await res.json()
        // Filtro client-side simples por dataPrevista (YYYY-MM-DD)
        const filtered = data.filter((o) => {
          if (!o.dataPrevista) return false
          const prev = ymd(new Date(o.dataPrevista))
          return prev === date
        })
        if (!cancelled) setItems(filtered)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Falha ao carregar agenda")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [date])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-slate-600">Compromissos e entregas por data.</p>
        </div>
        <div className="w-56">
          <label className="block text-sm text-slate-600 mb-1">Data</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader className="font-medium flex items-center justify-between">
          <span>Itens do dia</span>
          <span className="text-sm text-slate-500">{items.length} registro(s)</span>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-slate-500">Carregando agenda...</p>
          ) : error ? (
            <p className="text-slate-500">Não foi possível carregar a agenda.</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500">Nenhuma ordem para a data selecionada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dentista</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prevista</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.codigo}</TableCell>
                    <TableCell>{o.cliente?.nome ?? "-"}</TableCell>
                    <TableCell>{o.dentista?.nome ?? "-"}</TableCell>
                    <TableCell>{o.paciente?.nome ?? "-"}</TableCell>
                    <TableCell>{o.tipoPeca?.nome ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                    </TableCell>
                    <TableCell>{o.dataPrevista ? dateBR(o.dataPrevista) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
