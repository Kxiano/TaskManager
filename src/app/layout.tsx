import type { Metadata } from "next";
import Link from "next/link";
import { TRPCProvider } from "@/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Gerenciamento simples de tarefas com Next.js 15 e tRPC",
};

/*
 * I placed the tRPC provider in the root layout so the React Query
 * cache survives navigation between pages.
 *
 * I decided to add suppressHydrationWarning to <html> and <body> because browser
 * extensions (Grammarly, translators, password managers) add attributes to these
 * tags before React hydrates, which shows up as a hydration error in development.
 * Tradeoff: it only covers these two tags. Extensions that mark every element
 * (e.g. Bitdefender's bis_skin_checked) still trigger the dev warning, but I chose
 * not to silence the whole tree, because that would also hide real mismatches.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TRPCProvider>
          <header className="header">
            <Link href="/" className="brand">
              Gerenciador de Tarefas
            </Link>
          </header>
          <main className="container">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
