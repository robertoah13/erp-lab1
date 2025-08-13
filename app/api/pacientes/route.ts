import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PacienteSchema = z.object({
  nome: z.string().min(1),
  dataNascimento: z.string().optional(),
})

export async function GET() {
  try {
    const itens = await prisma.paciente.findMany({
      select: { id: true, nome: true, dataNascimento: true },
      orderBy: { nome: "asc" },
    })
    return NextResponse.json(
      itens.map((p) => ({ ...p, dataNascimento: p.dataNascimento ? p.dataNascimento.toISOString() : null }))
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = PacienteSchema.parse(body)
    const created = await prisma.paciente.create({
      data: {
        nome: data.nome,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
      },
    })
    return NextResponse.json({ ...created, dataNascimento: created.dataNascimento?.toISOString() ?? null }, { status: 201 })
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

