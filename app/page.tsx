import { prisma } from "@/lib/prisma"
import { money, dateBR } from "@/lib/format"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardKpis } from "@/components/dashboard-kpis"

export default async function Page() {
  const grouped = await prisma.ordem.groupBy({
    by: ["status"],
    _count: { _all: true },
  })
  const counts: Record<string, number> = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  )

  const realizadas = await prisma.ordem.findMany({
    where: { NOT: { status: "entrada" } },
    select: { valorTotal: true },
  })
  const totalFaturado = realizadas.reduce((acc, o) => acc + Number(o.valorTotal as unknown as number), 0)

  const ultimas = await prisma.ordem.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      cliente: { select: { nome: true } },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <DashboardKpis />

      <Card>
        <CardHeader className="font-medium">Últimas ordens</CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimas.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.codigo}</TableCell>
                  <TableCell>{o.cliente?.nome}</TableCell>
                  <TableCell><Badge variant={statusVariant(o.status)}>{o.status}</Badge></TableCell>
                  <TableCell>{money(Number(o.valorTotal as unknown as number))}</TableCell>
                  <TableCell>{dateBR(o.createdAt as unknown as Date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
