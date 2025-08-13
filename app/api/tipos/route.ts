import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const TipoSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  precoBase: z.coerce.number().nonnegative(),
})

export async function GET() {
  try {
    const itens = await prisma.tipoPeca.findMany({
      select: { id: true, nome: true, descricao: true, precoBase: true },
      orderBy: { nome: "asc" },
    })
    return NextResponse.json(itens.map((t) => ({ ...t, precoBase: Number(t.precoBase as unknown as number) })))
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = TipoSchema.parse(body)
    const created = await prisma.tipoPeca.create({
      data: {
        nome: data.nome,
        descricao: data.descricao ?? undefined,
        precoBase: data.precoBase,
      },
    })
    return NextResponse.json({ ...created, precoBase: Number(created.precoBase as unknown as number) }, { status: 201 })
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

