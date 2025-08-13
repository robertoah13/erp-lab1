"use client"
import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { KpiOrdensResponse } from "@/lib/types"
import { money } from "@/lib/format"

export function DashboardKpis() {
  const [kpi, setKpi] = React.useState<KpiOrdensResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/kpis/ordens", { cache: "no-store" })
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        const json: KpiOrdensResponse = await res.json()
        if (!cancelled) setKpi(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Falha ao carregar KPIs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <p className="text-slate-500">Carregando KPIs...</p>
  }
  if (error) {
    return <p className="text-slate-500">Não foi possível carregar KPIs.</p>
  }
  if (!kpi) return null

  const { byStatus, totalValor } = kpi
  const max = Math.max(1, ...Object.values(byStatus))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Kpi title="Entrada" value={byStatus.entrada} />
        <Kpi title="Produção" value={byStatus.producao} />
        <Kpi title="Finalizada" value={byStatus.finalizada} />
        <Kpi title="Entregue" value={byStatus.entregue} />
        <Kpi title="Faturamento Total (R$)" value={money(totalValor)} />
      </div>

      <Card>
        <CardHeader className="font-medium">Distribuição por status</CardHeader>
        <CardContent>
          <div className="space-y-2">
            {([
              ["entrada", byStatus.entrada],
              ["producao", byStatus.producao],
              ["finalizada", byStatus.finalizada],
              ["entregue", byStatus.entregue],
            ] as const).map(([label, value]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-24 text-sm text-slate-600 capitalize">{label}</div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-3 rounded">
                  <div
                    className="bg-slate-500 dark:bg-slate-400 h-3 rounded"
                    style={{ width: `${(value / max) * 100}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm">{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="text-sm text-slate-500">{title}</CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{String(value)}</div>
      </CardContent>
    </Card>
  )
}

