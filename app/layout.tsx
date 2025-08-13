import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"
import type { Route } from "next"
import { Providers } from "./providers"
import { BreadcrumbHost } from "@/app/_components/breadcrumb-host"

export const metadata: Metadata = {
  title: "ERP Lab",
  description: "Protótipo ERP para laboratório de prótese dental",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 border-r bg-white">
              <div className="p-4 font-semibold text-lg">ERP Lab</div>
              <nav className="px-2 space-y-1">
                <NavLink href="/">Dashboard</NavLink>
                <NavLink href="/ordens">Ordens</NavLink>
                <NavLink href="/cadastros">Cadastros</NavLink>
                <NavLink href="/agenda">Agenda</NavLink>
                <NavLink href="/configuracoes">Configurações</NavLink>
              </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <header className="border-b bg-white">
                <div className="container-app h-14 flex items-center justify-between">
                  <BreadcrumbHost />
                </div>
              </header>

              {/* Content */}
              <main className="container-app py-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: Route; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
    >
      {children}
    </Link>
  )
}
