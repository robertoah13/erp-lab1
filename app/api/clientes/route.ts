import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateSchema = z.object({
  nome: z.string().min(1),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  endereco: z.string().optional(),
})

export async function GET() {
  try {
    const itens = await prisma.cliente.findMany({
      select: { id: true, nome: true, telefone: true, email: true, endereco: true },
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
    const data = CreateSchema.parse(body)
    const created = await prisma.cliente.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })

  }
}
