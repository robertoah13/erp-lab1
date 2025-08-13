export type Status = "entrada" | "producao" | "finalizada" | "entregue"

export type KpiOrdensResponse = {
  byStatus: { entrada: number; producao: number; finalizada: number; entregue: number }
  totalValor: number
  hoje: number
}

