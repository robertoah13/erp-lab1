"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useSimpleToast } from "@/components/ui/toaster"
import { money } from "@/lib/format"

type Dentista = {
  id: number
  nome: string
  cro?: string | null
  telefone?: string | null
  email?: string | null
  clinica?: string | null
}

type Paciente = {
  id: number
  nome: string
  dataNascimento?: string | null
}

const TABS = [
  { key: "clientes", label: "Clientes" },
  { key: "dentistas", label: "Dentistas" },
  { key: "pacientes", label: "Pacientes" },
  { key: "tipos", label: "Tipos de Peça" },
] as const
type TabKey = (typeof TABS)[number]["key"]

export default function CadastrosPage() {
  const [tab, setTab] = React.useState<TabKey>("clientes")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cadastros</h1>

      {/* Tabs header */}
      <div className="flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-3 py-2 text-sm -mb-px border-b-2",
              tab === t.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabs content */}
      {tab === "clientes" && <ClientesTab />}

      {tab === "dentistas" && <DentistasTab />}

  {tab === "pacientes" && <PacientesTab />}
      {tab === "tipos" && <TiposTab />}
    </div>
  )
}

type Tipo = {
  id: number
  nome: string
  descricao?: string | null
  precoBase: number
}

function TiposTab() {
  const toast = useSimpleToast()

  const [itens, setItens] = React.useState<Tipo[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [openCreate, setOpenCreate] = React.useState<boolean>(false)
  const [openEdit, setOpenEdit] = React.useState<{ open: boolean; item: Tipo | null }>({
    open: false,
    item: null,
  })
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [reloadKey, setReloadKey] = React.useState<number>(0)

  const loadItens = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/tipos", { cache: "no-store" })
      if (!r.ok) throw new Error(`Erro ${r.status}`)
      const data: unknown = await r.json()
      setItens(Array.isArray(data) ? (data as Tipo[]) : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar tipos"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadItens()
  }, [loadItens, reloadKey])

  const Schema = z.object({
    nome: z.string().min(1, { message: "Informe o nome" }),
    descricao: z.string().optional(),
    precoBase: z.coerce.number().min(0, { message: "Informe um preço válido" }),
  })
  type FormValues = z.infer<typeof Schema>

  const createForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", descricao: "", precoBase: 0 },
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", descricao: "", precoBase: 0 },
  })

  React.useEffect(() => {
    if (openEdit.open && openEdit.item) {
      editForm.reset({
        nome: openEdit.item.nome ?? "",
        descricao: openEdit.item.descricao ?? "",
        precoBase: openEdit.item.precoBase ?? 0,
      })
    }
  }, [openEdit, editForm])

  const onSubmitCreate = async (values: FormValues) => {
    try {
      const r = await fetch("/api/tipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenCreate(false)
      toast.show("Tipo criado")
      setReloadKey((k) => k + 1)
      createForm.reset({ nome: "", descricao: "", precoBase: 0 })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao criar"
      toast.show("Falha ao criar", msg)
    }
  }

  const onSubmitEdit = async (values: FormValues) => {
    const id = openEdit.item?.id
    if (!id) return
    try {
      const r = await fetch(`/api/tipos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenEdit({ open: false, item: null })
      toast.show("Tipo atualizado")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar"
      toast.show("Falha ao atualizar", msg)
    }
  }

  const onDelete = async (id: number) => {
    const ok = confirm("Confirma excluir este tipo?")
    if (!ok) return
    try {
      setDeletingId(id)
      const r = await fetch(`/api/tipos/${id}`, { method: "DELETE", cache: "no-store" })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      toast.show("Tipo excluído")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir"
      toast.show("Falha ao excluir", msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tipos de Peça</h2>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenCreate(true)}>Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo tipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input placeholder="Nome" {...createForm.register("nome")} />
                {createForm.formState.errors.nome && (
                  <p className="text-xs text-red-600">{createForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Descrição</label>
                <Input placeholder="Descrição" {...createForm.register("descricao")} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Preço base</label>
                <Input type="number" step="0.01" placeholder="0,00" {...createForm.register("precoBase", { valueAsNumber: true })} />
                {createForm.formState.errors.precoBase && (
                  <p className="text-xs text-red-600">{createForm.formState.errors.precoBase.message as string}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpenCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-slate-500">Carregando...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço base</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.nome}</TableCell>
                    <TableCell>{t.descricao ?? "-"}</TableCell>
                    <TableCell>{money(t.precoBase)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={openEdit.open && openEdit.item?.id === t.id}
                          onOpenChange={(o) => setOpenEdit({ open: o, item: o ? t : null })}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setOpenEdit({ open: true, item: t })}>
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar tipo</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="grid gap-3">
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Nome</label>
                                <Input placeholder="Nome" {...editForm.register("nome")} />
                                {editForm.formState.errors.nome && (
                                  <p className="text-xs text-red-600">{editForm.formState.errors.nome.message}</p>
                                )}
                              </div>
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Descrição</label>
                                <Input placeholder="Descrição" {...editForm.register("descricao")} />
                              </div>
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Preço base</label>
                                <Input type="number" step="0.01" placeholder="0,00" {...editForm.register("precoBase", { valueAsNumber: true })} />
                                {editForm.formState.errors.precoBase && (
                                  <p className="text-xs text-red-600">{editForm.formState.errors.precoBase.message as string}</p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setOpenEdit({ open: false, item: null })}>
                                  Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm" disabled={deletingId === t.id} onClick={() => onDelete(t.id)}>
                          {deletingId === t.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {itens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-slate-500">
                      Nenhum registro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {toast.node}
    </Card>
  )
}

function DentistasTab() {
  const toast = useSimpleToast()

  // Estados
  const [dentistas, setDentistas] = React.useState<Dentista[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [openCreate, setOpenCreate] = React.useState<boolean>(false)
  const [openEdit, setOpenEdit] = React.useState<{
    open: boolean
    item: Dentista | null
  }>({ open: false, item: null })
  const [deletingId, setDeletingId] = React.useState<number | null>(
    null
  )
  const [reloadKey, setReloadKey] = React.useState<number>(0)

  // Carregar lista
  const loadDentistas = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/dentistas", { cache: "no-store" })
      if (!r.ok) throw new Error(`Erro ${r.status}`)
      const itens: Dentista[] = await r.json()
      setDentistas(Array.isArray(itens) ? itens : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar dentistas"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadDentistas()
  }, [loadDentistas, reloadKey])

  // Schema e formularios
  const Schema = z.object({
    nome: z.string().min(1, { message: "Informe o nome" }),
    cro: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email({ message: "E-mail inválido" }).optional(),
    clinica: z.string().optional(),
  })
  type FormValues = z.infer<typeof Schema>

  const createForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", cro: "", telefone: "", email: "", clinica: "" },
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", cro: "", telefone: "", email: "", clinica: "" },
  })

  // Popular form de edição quando abrir
  React.useEffect(() => {
    if (openEdit.open && openEdit.item) {
      editForm.reset({
        nome: openEdit.item.nome ?? "",
        cro: openEdit.item.cro ?? "",
        telefone: openEdit.item.telefone ?? "",
        email: openEdit.item.email ?? "",
        clinica: openEdit.item.clinica ?? "",
      })
    }
  }, [openEdit, editForm])

  // Ações
  const onSubmitCreate = async (values: FormValues) => {
    try {
      const r = await fetch("/api/dentistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenCreate(false)
      toast.show("Dentista criado")
      setReloadKey((k) => k + 1)
      createForm.reset()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao criar"
      toast.show("Falha ao criar", msg)
    }
  }

  const onSubmitEdit = async (values: FormValues) => {
    const id = openEdit.item?.id
    if (!id) return
    try {
      const r = await fetch(`/api/dentistas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenEdit({ open: false, item: null })
      toast.show("Dentista atualizado")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar"
      toast.show("Falha ao atualizar", msg)
    }
  }

  const onDelete = async (id: number) => {
    const ok = confirm("Confirma excluir este dentista?")
    if (!ok) return
    try {
      setDeletingId(id)
      const r = await fetch(`/api/dentistas/${id}`, {
        method: "DELETE",
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      toast.show("Dentista excluído")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir"
      toast.show("Falha ao excluir", msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Dentistas</h2>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenCreate(true)}>Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo dentista</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={createForm.handleSubmit(onSubmitCreate)}
              className="grid gap-3"
            >
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  placeholder="Nome"
                  {...createForm.register("nome")}
                />
                {createForm.formState.errors.nome && (
                  <p className="text-xs text-red-600">
                    {createForm.formState.errors.nome.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">CRO</label>
                  <Input placeholder="CRO" {...createForm.register("cro")} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    placeholder="Telefone"
                    {...createForm.register("telefone")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    placeholder="email@exemplo.com"
                    type="email"
                    {...createForm.register("email")}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-red-600">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Clínica</label>
                  <Input placeholder="Clínica" {...createForm.register("clinica")} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenCreate(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-slate-500">Carregando...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CRO</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Clínica</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dentistas.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.nome}</TableCell>
                    <TableCell>{d.cro ?? "-"}</TableCell>
                    <TableCell>{d.telefone ?? "-"}</TableCell>
                    <TableCell>{d.email ?? "-"}</TableCell>
                    <TableCell>{d.clinica ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={openEdit.open && openEdit.item?.id === d.id}
                          onOpenChange={(o) =>
                            setOpenEdit({ open: o, item: o ? d : null })
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOpenEdit({ open: true, item: d })
                              }
                            >
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar dentista</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={editForm.handleSubmit(onSubmitEdit)}
                              className="grid gap-3"
                            >
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                  placeholder="Nome"
                                  {...editForm.register("nome")}
                                />
                                {editForm.formState.errors.nome && (
                                  <p className="text-xs text-red-600">
                                    {editForm.formState.errors.nome.message}
                                  </p>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">CRO</label>
                                  <Input
                                    placeholder="CRO"
                                    {...editForm.register("cro")}
                                  />
                                </div>
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">Telefone</label>
                                  <Input
                                    placeholder="Telefone"
                                    {...editForm.register("telefone")}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">E-mail</label>
                                  <Input
                                    placeholder="email@exemplo.com"
                                    type="email"
                                    {...editForm.register("email")}
                                  />
                                  {editForm.formState.errors.email && (
                                    <p className="text-xs text-red-600">
                                      {editForm.formState.errors.email.message}
                                    </p>
                                  )}
                                </div>
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">Clínica</label>
                                  <Input
                                    placeholder="Clínica"
                                    {...editForm.register("clinica")}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => setOpenEdit({ open: false, item: null })}
                                >
                                  Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === d.id}
                          onClick={() => onDelete(d.id)}
                        >
                          {deletingId === d.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {dentistas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-slate-500">
                      Nenhum registro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {toast.node}
    </Card>
  )
}

function PacientesTab() {
  const toast = useSimpleToast()

  const [itens, setItens] = React.useState<Paciente[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [openCreate, setOpenCreate] = React.useState<boolean>(false)
  const [openEdit, setOpenEdit] = React.useState<{ open: boolean; item: Paciente | null }>({ open: false, item: null })
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [reloadKey, setReloadKey] = React.useState<number>(0)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/pacientes", { cache: "no-store" })
      if (!r.ok) throw new Error(`Erro ${r.status}`)
      const data: Paciente[] = await r.json()
      setItens(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar pacientes"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load, reloadKey])

  const Schema = z
    .object({
      nome: z.string().min(1, { message: "Informe o nome" }),
      dataNascimento: z
        .union([
          z.literal(""),
          z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida" }),
        ])
        .optional(),
    })
    .transform((v) => ({
      nome: v.nome,
      dataNascimento:
        v.dataNascimento && v.dataNascimento !== "" ? v.dataNascimento : undefined,
    }))
  type FormValues = z.infer<typeof Schema>

  const createForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", dataNascimento: "" },
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", dataNascimento: "" },
  })

  React.useEffect(() => {
    if (openEdit.open && openEdit.item) {
      editForm.reset({
        nome: openEdit.item.nome ?? "",
        dataNascimento: openEdit.item.dataNascimento ?? "",
      })
    }
  }, [openEdit, editForm])

  const onSubmitCreate = async (values: FormValues) => {
    try {
      const r = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenCreate(false)
      toast.show("Paciente criado")
      setReloadKey((k) => k + 1)
      createForm.reset()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao criar"
      toast.show("Falha ao criar", msg)
    }
  }

  const onSubmitEdit = async (values: FormValues) => {
    const id = openEdit.item?.id
    if (!id) return
    try {
      const r = await fetch(`/api/pacientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenEdit({ open: false, item: null })
      toast.show("Paciente atualizado")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar"
      toast.show("Falha ao atualizar", msg)
    }
  }

  const onDelete = async (id: number) => {
    const ok = confirm("Confirma excluir este paciente?")
    if (!ok) return
    try {
      setDeletingId(id)
      const r = await fetch(`/api/pacientes/${id}`, {
        method: "DELETE",
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      toast.show("Paciente excluído")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir"
      toast.show("Falha ao excluir", msg)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (iso?: string | null): string => {
    if (!iso) return "-"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const dd = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    return dd
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Pacientes</h2>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenCreate(true)}>Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input placeholder="Nome" {...createForm.register("nome")} />
                {createForm.formState.errors.nome && (
                  <p className="text-xs text-red-600">{createForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Nascimento</label>
                <Input type="date" placeholder="YYYY-MM-DD" {...createForm.register("dataNascimento")} />
                {createForm.formState.errors.dataNascimento && (
                  <p className="text-xs text-red-600">Data inválida</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpenCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-slate-500">Carregando...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nome}</TableCell>
                    <TableCell>{formatDate(p.dataNascimento)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={openEdit.open && openEdit.item?.id === p.id}
                          onOpenChange={(o) => setOpenEdit({ open: o, item: o ? p : null })}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setOpenEdit({ open: true, item: p })}>
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar paciente</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="grid gap-3">
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Nome</label>
                                <Input placeholder="Nome" {...editForm.register("nome")} />
                                {editForm.formState.errors.nome && (
                                  <p className="text-xs text-red-600">{editForm.formState.errors.nome.message}</p>
                                )}
                              </div>
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Nascimento</label>
                                <Input type="date" placeholder="YYYY-MM-DD" {...editForm.register("dataNascimento")} />
                                {editForm.formState.errors.dataNascimento && (
                                  <p className="text-xs text-red-600">Data inválida</p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setOpenEdit({ open: false, item: null })}>
                                  Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === p.id}
                          onClick={() => onDelete(p.id)}
                        >
                          {deletingId === p.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {itens.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-slate-500">
                      Nenhum registro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {toast.node}
    </Card>
  )
}

type Cliente = {
  id: number
  nome: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
}

function ClientesTab() {
  const toast = useSimpleToast()

  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [openCreate, setOpenCreate] = React.useState<boolean>(false)
  const [openEdit, setOpenEdit] = React.useState<{ open: boolean; item: Cliente | null }>({
    open: false,
    item: null,
  })
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [reloadKey, setReloadKey] = React.useState<number>(0)

  const loadClientes = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/clientes", { cache: "no-store" })
      if (!r.ok) throw new Error(`Erro ${r.status}`)
      const itens: Cliente[] = await r.json()
      setClientes(Array.isArray(itens) ? itens : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar clientes"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadClientes()
  }, [loadClientes, reloadKey])

  const Schema = z.object({
    nome: z.string().min(1, { message: "Informe o nome" }),
    telefone: z.string().optional(),
    email: z.string().email({ message: "E-mail inválido" }).optional(),
    endereco: z.string().optional(),
  })
  type FormValues = z.infer<typeof Schema>

  const createForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", telefone: "", email: "", endereco: "" },
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { nome: "", telefone: "", email: "", endereco: "" },
  })

  React.useEffect(() => {
    if (openEdit.open && openEdit.item) {
      editForm.reset({
        nome: openEdit.item.nome ?? "",
        telefone: openEdit.item.telefone ?? "",
        email: openEdit.item.email ?? "",
        endereco: openEdit.item.endereco ?? "",
      })
    }
  }, [openEdit, editForm])

  const onSubmitCreate = async (values: FormValues) => {
    try {
      const r = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenCreate(false)
      toast.show("Cliente criado")
      setReloadKey((k) => k + 1)
      createForm.reset()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao criar"
      toast.show("Falha ao criar", msg)
    }
  }

  const onSubmitEdit = async (values: FormValues) => {
    const id = openEdit.item?.id
    if (!id) return
    try {
      const r = await fetch(`/api/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      setOpenEdit({ open: false, item: null })
      toast.show("Cliente atualizado")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar"
      toast.show("Falha ao atualizar", msg)
    }
  }

  const onDelete = async (id: number) => {
    const ok = confirm("Confirma excluir este cliente?")
    if (!ok) return
    try {
      setDeletingId(id)
      const r = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
        cache: "no-store",
      })
      if (!r.ok) {
        const text = await r.text()
        throw new Error(text || `Erro ${r.status}`)
      }
      toast.show("Cliente excluído")
      setReloadKey((k) => k + 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir"
      toast.show("Falha ao excluir", msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Clientes</h2>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpenCreate(true)}>Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input placeholder="Nome" {...createForm.register("nome")} />
                {createForm.formState.errors.nome && (
                  <p className="text-xs text-red-600">{createForm.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input placeholder="Telefone" {...createForm.register("telefone")} />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input type="email" placeholder="email@exemplo.com" {...createForm.register("email")} />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-red-600">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Endereço</label>
                <Input placeholder="Endereço" {...createForm.register("endereco")} />
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpenCreate(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-slate-500">Carregando...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nome}</TableCell>
                    <TableCell>{c.telefone ?? "-"}</TableCell>
                    <TableCell>{c.email ?? "-"}</TableCell>
                    <TableCell>{c.endereco ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={openEdit.open && openEdit.item?.id === c.id}
                          onOpenChange={(o) => setOpenEdit({ open: o, item: o ? c : null })}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setOpenEdit({ open: true, item: c })}
                            >
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar cliente</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="grid gap-3">
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Nome</label>
                                <Input placeholder="Nome" {...editForm.register("nome")} />
                                {editForm.formState.errors.nome && (
                                  <p className="text-xs text-red-600">{editForm.formState.errors.nome.message}</p>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">Telefone</label>
                                  <Input placeholder="Telefone" {...editForm.register("telefone")} />
                                </div>
                                <div className="grid gap-1.5">
                                  <label className="text-sm font-medium">E-mail</label>
                                  <Input type="email" placeholder="email@exemplo.com" {...editForm.register("email")} />
                                  {editForm.formState.errors.email && (
                                    <p className="text-xs text-red-600">{editForm.formState.errors.email.message}</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid gap-1.5">
                                <label className="text-sm font-medium">Endereço</label>
                                <Input placeholder="Endereço" {...editForm.register("endereco")} />
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setOpenEdit({ open: false, item: null })}>
                                  Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === c.id}
                          onClick={() => onDelete(c.id)}
                        >
                          {deletingId === c.id ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {clientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-slate-500">
                      Nenhum registro
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {toast.node}
    </Card>
  )
}
