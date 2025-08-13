import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  // Helpers
  const up = async <T extends { where:any; create:any }>(model: any, items: {where:any; create:any}[]) => {
    for (const it of items) {
      await model.upsert({ where: it.where, update: {}, create: it.create })
    }
  }

  // Clientes
  await up(prisma.cliente, Array.from({length:10}).map((_,i)=>({
    where:{ email:`cliente${i+1}@ex.com` },
    create:{ nome:`Cliente ${i+1}`, email:`cliente${i+1}@ex.com`, telefone:`(11) 9999-000${i}` }
  })))

  // Dentistas
  await up(prisma.dentista, Array.from({length:10}).map((_,i)=>({
    where:{ cro:`CRO${1000+i}` },
    create:{ nome:`Dr. Dentista ${i+1}`, cro:`CRO${1000+i}`, telefone:`(11) 9888-000${i}` }
  })))

  // Pacientes
  await up(prisma.paciente, Array.from({length:10}).map((_,i)=>({
    where:{ id:i+1 }, // artifício pra upsert idempotente
    create:{ nome:`Paciente ${i+1}` }
  })))

  // Tipos de peça
  const tipos = ["Coroa de Porcelana","Ponte Fixa","Lente de Contato","Inlay/Onlay","Implante Unitário","Reembasamento","Zircônia","PPR"]
  await up(prisma.tipoPeca, tipos.map((nome, i)=>({
    where:{ id:i+1 },
    create:{ nome, descricao:`${nome} - descrição`, precoBase: 500 + i*100 }
  })))

  // Buscar IDs para relações
  const clientes  = await prisma.cliente.findMany({ select:{id:true} })
  const dentistas = await prisma.dentista.findMany({ select:{id:true} })
  const pacientes = await prisma.paciente.findMany({ select:{id:true} })
  const tiposPeca = await prisma.tipoPeca.findMany({ select:{id:true} })

  function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const statuses = ["entrada","producao","finalizada","entregue"] as const

  // 20 ordens
  for (let i=1;i<=20;i++){
    const codigo = `ORD-${String(1000+i)}`
    await prisma.ordem.upsert({
      where:{ codigo },
      update:{},
      create:{
        codigo,
        status: pick(statuses),
        clienteId: pick(clientes).id,
        dentistaId: pick(dentistas).id,
        pacienteId: pick(pacientes).id,
        tipoPecaId: pick(tiposPeca).id,
        dataPrevista: new Date(),
        valorTotal: Number((500 + Math.random()*2000).toFixed(2)),
        observacoes: Math.random()>0.7 ? "Observação exemplo" : null
      }
    })
  }
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1) })
