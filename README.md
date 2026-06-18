# Orçamento Casamento

Aplicação mobile-first para controlar o orçamento de casamento: fornecedores, valores orçados/contratados/pagos e pendências financeiras.

**Produção:** https://orcamento-casamento.vercel.app

## Funcionalidades

- **Resumo** (`/`) — cards de totais, gráfico de gasto por categoria e maiores pendências
- **Fornecedores** (`/fornecedores`) — listagem com filtros, ordenação, edição e exclusão
- **Pendências** (`/pendencias`) — fornecedores com pagamento em aberto
- **Mais** (`/mais`) — informações e atalhos
- **PWA** — ícone L&P na Tela de Início do iPhone (Safari → Adicionar à Tela de Início)
- **Tab bar mobile** — navegação com botão central para novo fornecedor

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Base UI |
| Formulários | react-hook-form + Zod |
| Banco | PostgreSQL, Prisma 7 (`@prisma/adapter-pg`) |
| Produção | Supabase + Vercel |
| Local | Docker Compose (Postgres 16) |

## Pré-requisitos

- Node.js 20+
- npm
- Docker (opcional, para banco local)

## Configuração local

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL conforme ambiente (local ou Supabase)

# 3. Subir Postgres local
npm run db:up

# 4. Aplicar migrations
npm run db:migrate

# 5. Popular dados (opcional)
npm run db:seed

# 6. Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Banco local (Docker)

```env
DATABASE_URL="postgresql://orcamento:orcamento@localhost:5432/orcamento_casamento"
```

### Supabase (dev ou produção)

Use a **Transaction pooler** do painel *Connect* (não use conexão direta `db.*` em redes só IPv4):

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

> O cluster/região (`aws-1-us-west-2`) varia por projeto — copie a URL exata do dashboard.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (escrever) |
| `npm run format:check` | Prettier (verificar) |
| `npm run db:up` | Sobe Postgres via Docker |
| `npm run db:down` | Para Postgres |
| `npm run db:migrate` | Migrations Prisma (`migrate dev`) |
| `npm run db:seed` | Importa/atualiza `data.csv` |
| `npm run db:export-csv` | Exporta fornecedores para CSV |

## Estrutura do projeto

```
src/
├── app/
│   ├── (main)/           # Rotas com shell mobile/desktop
│   │   ├── page.tsx      # Resumo
│   │   ├── fornecedores/
│   │   ├── pendencias/
│   │   └── mais/
│   ├── actions.ts        # Server Actions (CRUD)
│   ├── layout.tsx
│   ├── manifest.ts       # PWA
│   ├── favicon.ico       # Ícone L&P
│   ├── icon.png          # 32×32
│   └── apple-icon.png    # 180×180 (iOS)
├── components/
│   ├── layout/           # MobileShell, TabBar, DesktopNav
│   ├── VendorForm.tsx
│   ├── VendorTable.tsx
│   └── CategorySpendingChart.tsx
└── lib/
    ├── categories.ts     # Taxonomia de categorias
    ├── vendor-utils.ts   # Helpers e fetch
    ├── validations.ts    # Schemas Zod
    └── db.ts             # Prisma + pool Supabase

prisma/
├── schema.prisma
└── migrations/

data.csv                  # Fonte do seed
docker-compose.yml
```

## Modelo de dados

Tabela `vendors`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do fornecedor |
| `service` | string | Serviço prestado |
| `category` | string | Uma das 13 categorias |
| `budgeted_amount` | decimal | Valor orçado |
| `contracted_amount` | decimal? | Valor contratado |
| `paid_amount` | decimal | Valor já pago (default 0) |

### Regras de negócio

- **Pendência:** `contracted_amount > 0` e `paid_amount < contracted_amount`
- **Pago:** `contracted_amount > 0` e `paid_amount >= contracted_amount`
- Fornecedores só com orçado (sem contratado) **não** aparecem em Pendências
- Cards/linhas pagos têm fundo verde suave e badge **Pago**

### Categorias

Definidas em `src/lib/categories.ts` (13 categorias). O seed normaliza categorias legadas via `normalizeCategory()`.

## Deploy (Vercel)

1. Conecte o repositório à Vercel
2. Configure `DATABASE_URL` com a URL do **pooler** Supabase (porta `6543`)
3. Deploy automático a cada push na `main`

```bash
npx prisma migrate deploy   # aplicar migrations em produção (se necessário)
npm run db:seed           # sincronizar dados do CSV (opcional)
```

## Supabase

- **Projeto:** `kobjvzkbmymcbvdurzjo`
- **MCP Cursor:** configurado em `.cursor/mcp.json`
- **RLS:** habilitado na tabela `vendors` (migration `enable_rls`)
- Migrations aplicadas via `prisma migrate resolve` + `migrate deploy` quando o schema já existia

## PWA / Tela de Início (iPhone)

1. Abra o site no Safari
2. Compartilhar → **Adicionar à Tela de Início**
3. Ícone L&P e nome **Orçamento**

Se o ícone não atualizar, remova o atalho antigo e adicione novamente.

## Desenvolvimento

- Server Actions em `src/app/actions.ts` revalidam todas as rotas após mutações
- Páginas sob `(main)` usam `dynamic = 'force-dynamic'` para dados sempre frescos
- Validação obrigatória com Zod em actions e formulários
- Tokens Tailwind do tema — evite cores hex fixas na UI
