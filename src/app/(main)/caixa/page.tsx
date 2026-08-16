import { Plus } from 'lucide-react';
import { CashSummaryCards } from '@/components/CashSummaryCards';
import { DeleteIncomeButton } from '@/components/DeleteIncomeButton';
import { IncomeForm } from '@/components/IncomeForm';
import { MarkIncomeButton } from '@/components/MarkIncomeButton';
import { StartingBalanceForm } from '@/components/StartingBalanceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildCashSnapshot, fetchCashData } from '@/lib/cash-data';
import { isCashCovered, splitIncomes } from '@/lib/cash-utils';
import { fetchVendors } from '@/lib/vendor-utils';
import { formatCurrency, formatDueDate } from '@/lib/utils';

export default async function CaixaPage() {
  const [vendors, { settings, incomes }] = await Promise.all([fetchVendors(), fetchCashData()]);
  const snapshot = buildCashSnapshot(settings.starting_balance, incomes, vendors);
  const { pending, received } = splitIncomes(incomes);
  const covered = isCashCovered(snapshot.coverage);
  const upcomingUncovered =
    snapshot.upcomingDueRemaining > 0 && snapshot.cashOnHand < snapshot.upcomingDueRemaining;

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Caixa</h1>
          <p className="text-sm text-muted-foreground">
            Dinheiro disponível e receitas para pagar os fornecedores
          </p>
        </div>
        <IncomeForm
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Receita
            </Button>
          }
        />
      </div>

      <CashSummaryCards
        cashOnHand={snapshot.cashOnHand}
        pendingIncomes={snapshot.pendingIncomes}
        projected={snapshot.projected}
        coverage={snapshot.coverage}
      />

      {!covered && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Com o caixa atual e as receitas previstas, ainda faltam{' '}
          {formatCurrency(Math.abs(snapshot.coverage))} para cobrir o que resta pagar.
        </p>
      )}

      {upcomingUncovered && (
        <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          O caixa atual ({formatCurrency(snapshot.cashOnHand)}) não cobre os vencimentos
          cadastrados ({formatCurrency(snapshot.upcomingDueRemaining)}).
        </p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Saldo inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <StartingBalanceForm
            key={snapshot.startingBalance}
            startingBalance={snapshot.startingBalance}
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">A entrar</h2>
          <span className="text-sm text-muted-foreground">
            {pending.length} {pending.length === 1 ? 'receita' : 'receitas'}
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
            Nenhuma receita prevista. Adicione o que ainda vai entrar.
          </div>
        ) : (
          pending.map((income) => (
            <IncomeCard key={income.id} income={income} received={false} />
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recebidas</h2>
          <span className="text-sm text-muted-foreground">
            {received.length} {received.length === 1 ? 'receita' : 'receitas'}
          </span>
        </div>
        {received.length === 0 ? (
          <div className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground">
            Nenhuma receita recebida ainda.
          </div>
        ) : (
          received.map((income) => (
            <IncomeCard key={income.id} income={income} received />
          ))
        )}
      </section>
    </main>
  );
}

function IncomeCard({
  income,
  received,
}: {
  income: {
    id: string;
    description: string;
    amount: number;
    expected_date: Date | null;
    received_at: Date | null;
  };
  received: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{income.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {received
              ? `Recebida em ${formatDueDate(income.received_at)}`
              : income.expected_date
                ? `Previsão: ${formatDueDate(income.expected_date)}`
                : 'Sem data prevista'}
          </p>
        </div>
        <p className="shrink-0 font-semibold">{formatCurrency(income.amount)}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <IncomeForm
          income={income}
          trigger={
            <Button variant="outline" size="sm">
              Editar
            </Button>
          }
        />
        <MarkIncomeButton id={income.id} received={received} />
        <DeleteIncomeButton id={income.id} />
      </div>
    </div>
  );
}
