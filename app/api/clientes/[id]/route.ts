import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ClienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  endereco: z.string().optional(),
})

const PatchSchema = ClienteSchema.partial()

function parseId(idParam: string): number | null {
  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) return null
  return id
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const item = await prisma.cliente.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    return NextResponse.json(item)
  } catch (e: unknown) {
    const message = (e as Error)?.message ?? "Erro"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const body = await req.json()
    const data = PatchSchema.parse(body)

    const exists = await prisma.cliente.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    const updated = await prisma.cliente.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.issues }, { status: 400 })
    }
    const message = e?.message ?? "Erro"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id)
    if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const exists = await prisma.cliente.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    await prisma.cliente.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = (e as Error)?.message ?? "Erro"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

