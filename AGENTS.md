<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Orçamento Casamento — guia para agentes

## Contexto

App de orçamento de casamento (mobile-first). Um modelo `Vendor` no Postgres. Sem autenticação. Produção em Vercel + Supabase.

## Stack

- Next.js 16 App Router, React 19
- Prisma 7 com `@prisma/adapter-pg` e driver `pg`
- shadcn/ui + Base UI, Tailwind 4
- Zod + react-hook-form em todos os formulários
- Toasts: `sonner`

## Rotas (`src/app/(main)/`)

| Rota | Página |
|------|--------|
| `/` | Resumo (totais, gráfico por categoria, pendências) |
| `/fornecedores` | Lista com filtros e ordenação (`searchParams`) |
| `/pendencias` | Só fornecedores com contratado > 0 e pagamento em aberto |
| `/mais` | Info e categorias |

Layout: `MobileShell` (tab bar mobile + `DesktopNav`). `(main)/layout.tsx` exporta `dynamic = 'force-dynamic'`.

## Banco de dados

- Schema: `prisma/schema.prisma` → tabela `vendors`
- Migrations em `prisma/migrations/`
- Local: `npm run db:up` + `DATABASE_URL` localhost
- Produção: pooler Supabase (`aws-*-*.pooler.supabase.com:6543?pgbouncer=true`)
- `src/lib/db.ts`: SSL explícito para Supabase; não use `sslmode=require` na URL

### Mutations (`src/app/actions.ts`)

Após create/update/delete, chamar `revalidateVendorPages()` (revalida `/`, `/fornecedores`, `/pendencias`, `/mais`).

## Regras de domínio

- `getVendorRemaining(v) = contracted - paid`
- `isVendorFullyPaid`: contratado > 0 e remaining <= 0
- Pendências: `!isVendorFullyPaid && contracted > 0`
- Categorias: `src/lib/categories.ts` — usar `normalizeCategory()` no seed

## Convenções de código

- **Validação:** Zod em actions e forms; não validar manualmente no `onSubmit`
- **UI:** tokens Tailwind (`text-primary`, `bg-card`, etc.) — sem hex fixo em componentes
- **Ícones:** `lucide-react`
- **Componentes:** recebem dados via props; data fetching nas pages/actions
- **Escopo:** mudanças mínimas; não refatorar o que não foi pedido

## Arquivos-chave

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/app/actions.ts` | CRUD + revalidação |
| `src/lib/vendor-utils.ts` | `fetchVendors`, totais, gráfico por categoria |
| `src/components/VendorForm.tsx` | Dialog criar/editar (`router.refresh()` após salvar) |
| `src/components/VendorTable.tsx` | Tabela desktop + cards mobile |
| `seed.ts` | Upsert por nome a partir de `data.csv` |

## Ambiente

Copiar `.env.example` → `.env`. **Nunca commitar `.env`.**

## Supabase MCP

`.cursor/mcp.json` aponta para `project_ref=kobjvzkbmymcbvdurzjo`. Autenticar via OAuth no Cursor se o MCP estiver desconectado.

## Testes

Não há suite de testes automatizada no momento. Validar com `npm run build` e fluxo manual nas 4 rotas.
