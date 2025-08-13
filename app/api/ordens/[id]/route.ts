import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrdemSchema } from "@/lib/schemas"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id)
  if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  const ordem = await prisma.ordem.findUnique({
    where: { id },
    include: {
      cliente: { select: { id: true, nome: true } },
      dentista: { select: { id: true, nome: true } },
      paciente: { select: { id: true, nome: true } },
      tipoPeca: { select: { id: true, nome: true } },
    },
  })
  if (!ordem) return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
  return NextResponse.json({ ...ordem, valorTotal: Number(ordem.valorTotal as unknown as number) })
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    const data = await req.json()
    const parsed = OrdemSchema.partial().parse(data)

    const updated = await prisma.ordem.update({
      where: { id },
      data: {
        ...parsed,
        dataPrevista: parsed.dataPrevista ?? undefined,
        observacoes: parsed.observacoes ?? undefined,
      },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ error: err?.message ?? "Erro ao atualizar ordem" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    await prisma.ordem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ error: err?.message ?? "Erro ao excluir ordem" }, { status: 500 })
  }
}

