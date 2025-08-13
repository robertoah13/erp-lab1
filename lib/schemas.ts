import { z } from "zod"

export type Status = "entrada" | "producao" | "finalizada" | "entregue"
export const StatusUnion = z.enum(["entrada", "producao", "finalizada", "entregue"])
export const OrdemSchema = z.object({
  codigo: z.string().min(1),
  status: StatusUnion,
  clienteId: z.number().int().positive(),
  dentistaId: z.number().int().positive(),
  pacienteId: z.number().int().positive(),
  tipoPecaId: z.number().int().positive(),
  dataPrevista: z.string().datetime().optional(),
  valorTotal: z.number().nonnegative(),
  observacoes: z.string().optional(),
})
