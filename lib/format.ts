export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

export const dateBR = (s: string | Date) => new Date(s).toLocaleDateString("pt-BR")

