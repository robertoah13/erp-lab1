# ERP Lab

Aplicação Next.js com Prisma + SQLite para gestão de ordens de laboratório.

## Requisitos

- Node.js 18+ (LTS recomendado).
- NPM 9+ ou PNPM/Yarn (exemplos com NPM).
- Windows: usar WSL2 (Ubuntu recomendado) para melhor compatibilidade.

## Setup

- Instale dependências: `npm i`.
- Crie um arquivo `.env` com `DATABASE_URL="file:./prisma/dev.db"`.
  - O banco SQLite é local, em `prisma/dev.db` (criado no primeiro `db:push`).

## Comandos

- `npm run dev`: inicia em desenvolvimento (http://localhost:3000).
- `npm run build`: build de produção do Next.js.
- `npm run start`: roda a build em produção.
- `npm run db:push`: aplica o schema Prisma no SQLite local.
- `npm run db:seed`: popula dados de exemplo (idempotente).
- `npm run lint`: análise estática com ESLint.

## Fluxo de Primeira Execução

1. `npm i`
2. `npm run db:push`
3. `npm run db:seed`
4. `npm run dev`

## URLs e Login

- App: `http://localhost:3000`
- Rotas principais:
  - `/` Dashboard
  - `/ordens` Ordens
  - `/cadastros` Cadastros
  - `/agenda` Agenda
  - `/configuracoes` Configurações
- Login: não há autenticação no ambiente de desenvolvimento; acesso direto às rotas.

## Observações (SQLite local)

- Banco de desenvolvimento é SQLite local em `prisma/dev.db`.
- `db:push` atualiza/cria a estrutura conforme `prisma/schema.prisma`.
- `db:seed` é seguro para reexecutar (usa upsert para dados base e exemplos).

## Dashboard & Ordens

- Acesse `Dashboard` para uma visão geral:
  - Cards com contagem por status (entrada, producao, finalizada, entregue).
  - Card de faturamento (soma de `valorTotal` das ordens com status diferente de `entrada`).
  - Tabela "Últimas ordens" com Código, Cliente, Status, Valor (BRL) e data de criação.

- Em `Ordens`:
  - Filtro por status via Select; mantém o valor e recarrega ao alterar.
  - Coluna `Status` com Badge colorido por status.
  - Valores formatados em BRL e datas em `dd/MM/yyyy`.
  - Ações por linha:
    - `Editar`: abre modal com os dados preenchidos e salva via PATCH.
    - `Excluir`: confirma, envia DELETE e recarrega a lista.
  - Modal `Nova Ordem`/`Editar Ordem`:
    - Decide entre POST (criar) e PATCH (editar) automaticamente.
    - Dispara toasts de sucesso/erro nas ações de criação, edição e exclusão.

## Deploy na Vercel

1. Instale a CLI: `npm i -g vercel` (ou use `npx vercel`).
2. Vincule o projeto: `vercel link`.
3. Defina as variáveis de ambiente em "Project Settings":
   - `DATABASE_URL` (ex.: `file:./prisma/dev.db`).
4. Faça o deploy: `vercel --prod`.
