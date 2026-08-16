import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isCashCovered, type CashTotals } from '@/lib/cash-utils';
import { formatCurrency } from '@/lib/utils';

export function CashSummaryCards({
  cashOnHand,
  pendingIncomes,
  projected,
  coverage,
}: Pick<CashTotals, 'cashOnHand' | 'pendingIncomes' | 'projected' | 'coverage'>) {
  const covered = isCashCovered(coverage);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Caixa atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold md:text-2xl">{formatCurrency(cashOnHand)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold md:text-2xl">{formatCurrency(pendingIncomes)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary md:text-2xl">
            {formatCurrency(projected)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{covered ? 'Sobra' : 'Falta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-xl font-bold md:text-2xl ${covered ? 'text-primary' : 'text-destructive'}`}
          >
            {formatCurrency(Math.abs(coverage))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
