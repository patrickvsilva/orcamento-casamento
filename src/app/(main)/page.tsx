import Link from 'next/link';
import { ArrowRight, List, Clock, Wallet } from 'lucide-react';
import { BudgetSummaryCards } from '@/components/BudgetSummaryCards';
import { CategorySpendingChart } from '@/components/CategorySpendingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { buildCashSnapshot, fetchCashData } from '@/lib/cash-data';
import { isCashCovered } from '@/lib/cash-utils';
import {
  computeBudgetTotals,
  computeCategorySpending,
  fetchVendors,
  getVendorRemaining,
} from '@/lib/vendor-utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default async function ResumoPage() {
  const [vendors, { settings, incomes }] = await Promise.all([fetchVendors(), fetchCashData()]);
  const totals = computeBudgetTotals(vendors);
  const categorySpending = computeCategorySpending(vendors);
  const cash = buildCashSnapshot(settings.starting_balance, incomes, vendors);
  const cashCovered = isCashCovered(cash.coverage);
  const upcomingUncovered =
    cash.upcomingDueRemaining > 0 && cash.cashOnHand < cash.upcomingDueRemaining;

  const allPendingVendors = vendors.filter((v) => {
    const remaining = getVendorRemaining(v);
    return (v.contracted_amount || 0) > 0 && remaining > 0;
  });

  const pendingVendors = [...allPendingVendors]
    .sort((a, b) => getVendorRemaining(b) - getVendorRemaining(a))
    .slice(0, 5);

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
      <div className="md:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Resumo</h1>
        <p className="text-sm text-muted-foreground">Visão geral do orçamento</p>
      </div>

      <BudgetSummaryCards {...totals} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Caixa do casamento</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Caixa atual</p>
              <p className="font-semibold">{formatCurrency(cash.cashOnHand)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">A entrar</p>
              <p className="font-semibold">{formatCurrency(cash.pendingIncomes)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Projetado</p>
              <p className="font-semibold">{formatCurrency(cash.projected)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{cashCovered ? 'Sobra' : 'Falta'}</p>
              <p className={`font-semibold ${cashCovered ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(Math.abs(cash.coverage))}
              </p>
            </div>
          </div>
          {upcomingUncovered && (
            <p className="text-sm text-destructive">
              O caixa atual não cobre os vencimentos cadastrados (
              {formatCurrency(cash.upcomingDueRemaining)}).
            </p>
          )}
          <Link
            href="/caixa"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
          >
            Gerenciar caixa e receitas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      <CategorySpendingChart data={categorySpending} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Maiores pendências</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pendência no momento.</p>
            ) : (
              pendingVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{vendor.name}</span>
                  <span className="shrink-0 font-semibold text-destructive">
                    {formatCurrency(getVendorRemaining(vendor))}
                  </span>
                </div>
              ))
            )}
            <Link
              href="/pendencias"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
            >
              Ver todas as pendências
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Atalhos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/fornecedores"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
            >
              Fornecedores
              <span className="text-muted-foreground">{vendors.length}</span>
            </Link>
            <Link
              href="/pendencias"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
            >
              Pendências
              <span className="text-muted-foreground">
                {allPendingVendors.length > 0 ? `${allPendingVendors.length} em aberto` : '—'}
              </span>
            </Link>
            <Link
              href="/caixa"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
            >
              Caixa
              <span className="text-muted-foreground">{formatCurrency(cash.cashOnHand)}</span>
            </Link>
            <Link
              href="/mais"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
            >
              Configurações e mais
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
