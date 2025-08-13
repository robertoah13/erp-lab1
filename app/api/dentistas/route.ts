import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const DentistaSchema = z.object({
  nome: z.string().min(1),
  cro: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  clinica: z.string().optional(),
})

export async function GET() {
  try {
    const itens = await prisma.dentista.findMany({
      select: { id: true, nome: true, cro: true, telefone: true, email: true, clinica: true },
      orderBy: { nome: "asc" },
    })
    return NextResponse.json(itens)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = DentistaSchema.parse(body)
    const created = await prisma.dentista.create({
      data: {
        nome: data.nome,
        cro: data.cro ?? undefined,
        telefone: data.telefone ?? undefined,
        email: data.email ?? undefined,
        clinica: data.clinica ?? undefined,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

