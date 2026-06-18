# Backlog — Orçamento Casamento

Prioridades e status do produto. Atualizado em jun/2026.

## Legenda

- ✅ Concluído
- 🚧 Em andamento
- ⬜ Pendente

---

## Sprint 1 — Shell mobile e navegação ✅

| ID | Item | Status |
|----|------|--------|
| MOB-01 | Layout mobile com tab bar (liquid glass) | ✅ |
| MOB-02 | Rotas: Resumo, Fornecedores, Pendências, Mais | ✅ |
| MOB-03 | Cards de resumo do orçamento | ✅ |
| MOB-04 | Tabela de fornecedores no desktop | ✅ |
| MOB-05 | Navegação desktop (sidebar/top) | ✅ |

---

## Sprint 2 — UX mobile em fornecedores ✅

| ID | Item | Status |
|----|------|--------|
| MOB-10 | Cards de fornecedor no mobile | ✅ |
| MOB-11 | Filtros com chips scrolláveis no mobile | ✅ |
| MOB-12 | Formulário em bottom sheet no mobile | ✅ |
| MOB-13 | Excluir com confirmação via Dialog (não `window.confirm`) | ✅ |
| MOB-14 | Buscar fornecedor por nome | ✅ |
| MOB-15 | Menu de ações no card mobile | ✅ |

---

## Sprint 2–3 — Pendências e resumo

| ID | Item | Status |
|----|------|--------|
| MOB-20 | Página de pendências (só contratados com saldo) | ✅ |
| MOB-21 | Pagamento rápido sem abrir formulário completo | ✅ |
| MOB-22 | Barra de progresso do orçamento | ✅ |
| MOB-23 | Gráfico de gastos por categoria | ✅ |

---

## Sprint 3+ — Polish e PWA ✅

| ID | Item | Status |
|----|------|--------|
| MOB-30 | Transições entre telas | ✅ |
| MOB-31 | Toggle de dark mode na UI | ✅ |
| MOB-32 | Feedback háptico (onde suportado) | ✅ |
| MOB-33 | Pull-to-refresh | ✅ |
| MOB-34 | Skeletons de carregamento | ✅ |
| MOB-35 | Swipe para ações no card | ✅ |

### PWA

| ID | Item | Status |
|----|------|--------|
| PWA-01 | `manifest.webmanifest` | ✅ |
| PWA-02 | Ícones / apple-touch-icon | ✅ |
| PWA-03 | Service worker offline | ✅ |
| PWA-04 | Instalação guiada (prompt) | ✅ |
| PWA-05 | Splash screen customizada | ✅ |

---

## Dados e domínio

| ID | Item | Status |
|----|------|--------|
| DATA-01 | Prisma + PostgreSQL (Supabase prod, Docker local) | ✅ |
| DATA-02 | Campo `next_due_date` para vencimentos | ⬜ |
| DATA-03 | Enum de status (orçado / contratado / pago) | ⬜ |
| DATA-04 | Seed a partir do CSV | ✅ |
| DATA-05 | RLS habilitado em `vendors` | ✅ |

---

## Infra e qualidade

| ID | Item | Status |
|----|------|--------|
| INFRA-01 | Deploy Vercel + Supabase pooler | ✅ |
| INFRA-02 | Revalidação de cache multi-rota após CRUD | ✅ |
| QA-01 | Testes unitários (use cases / actions) | ⬜ |
| QA-02 | Autenticação multi-usuário | ⬜ |
| QA-03 | Coluna "Valor pago" na tabela desktop | ⬜ |
| QA-04 | Filtros e ordenação no banco (não só em memória) | ⬜ |
| QA-05 | Colunas vencimento/status no CSV | ⬜ |

---

## Próximo foco sugerido

1. **DATA-02 / DATA-03** — vencimentos e status explícito  
2. **QA-01** — testes unitários nas server actions  
3. **QA-03** — coluna "Valor pago" na tabela desktop
