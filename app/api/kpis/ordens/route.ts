import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { KpiOrdensResponse } from "@/lib/types"

export async function GET() {
  try {
    // Group by status
    const groups = await prisma.ordem.groupBy({
      by: ["status"],
      _count: { _all: true },
    })

    const by: KpiOrdensResponse["byStatus"] = {
      entrada: 0,
      producao: 0,
      finalizada: 0,
      entregue: 0,
    }
    for (const g of groups) {
      // status is a string field in schema
      const key = g.status as keyof typeof by
      if (key in by) by[key] = g._count._all
    }

    // Sum total value
    const total = await prisma.ordem.aggregate({
      _sum: { valorTotal: true },
    })

    // Count today's entries (local day boundaries)
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(23, 59, 59, 999)
    const hoje = await prisma.ordem.count({
      where: { dataEntrada: { gte: start, lte: end } },
    })

    const payload: KpiOrdensResponse = {
      byStatus: by,
      totalValor: Number(total._sum.valorTotal ?? 0),
      hoje,
    }
    return NextResponse.json(payload)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 })
  }
}

