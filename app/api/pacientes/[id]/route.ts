import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PacienteSchema = z.object({
  nome: z.string().min(1),
  dataNascimento: z.string().optional(),
})
const PatchSchema = PacienteSchema.partial()

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) return null
  return id
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    const item = await prisma.paciente.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    return NextResponse.json({ ...item, dataNascimento: item.dataNascimento?.toISOString() ?? null })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error)?.message ?? "Erro" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const body = await req.json()
    const data = PatchSchema.parse(body)
    const exists = await prisma.paciente.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })

    const updated = await prisma.paciente.update({
      where: { id },
      data: {
        nome: data.nome ?? undefined,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
      },
    })
    return NextResponse.json({ ...updated, dataNascimento: updated.dataNascimento?.toISOString() ?? null })
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    const exists = await prisma.paciente.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    await prisma.paciente.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error)?.message ?? "Erro" }, { status: 500 })
  }
}

