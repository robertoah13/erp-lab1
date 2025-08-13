import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrdemSchema, StatusUnion } from "@/lib/schemas"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const where = status && StatusUnion.safeParse(status).success ? { status } : {}

    const ordens = await prisma.ordem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { id: true, nome: true } },
        dentista: { select: { id: true, nome: true } },
        paciente: { select: { id: true, nome: true } },
        tipoPeca: { select: { id: true, nome: true } },
      },
    })

    return NextResponse.json(
      ordens.map((o) => ({
        ...o,
        // Ensure serializable numbers/decimals
        valorTotal: Number(o.valorTotal as unknown as number),
      }))
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Erro ao listar ordens" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const parsed = OrdemSchema.parse(data)

    const created = await prisma.ordem.create({
      data: {
        codigo: parsed.codigo,
        status: parsed.status,
        clienteId: parsed.clienteId,
        dentistaId: parsed.dentistaId,
        pacienteId: parsed.pacienteId,
        tipoPecaId: parsed.tipoPecaId,
        dataPrevista: parsed.dataPrevista ?? null,
        valorTotal: parsed.valorTotal,
        observacoes: parsed.observacoes ?? null,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: err?.message ?? "Erro ao criar ordem" }, { status: 500 })
  }
}

