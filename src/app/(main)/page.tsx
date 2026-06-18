import Link from 'next/link';
import { ArrowRight, List, Clock } from 'lucide-react';
import { BudgetSummaryCards } from '@/components/BudgetSummaryCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { computeBudgetTotals, fetchVendors, getVendorRemaining } from '@/lib/vendor-utils';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default async function ResumoPage() {
  const vendors = await fetchVendors();
  const totals = computeBudgetTotals(vendors);

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
