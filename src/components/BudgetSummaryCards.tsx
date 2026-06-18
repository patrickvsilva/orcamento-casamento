import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface BudgetSummaryCardsProps {
  totalBudgeted: number;
  totalContracted: number;
  totalPaid: number;
  totalRemaining: number;
}

export function BudgetSummaryCards({
  totalBudgeted,
  totalContracted,
  totalPaid,
  totalRemaining,
}: BudgetSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold md:text-2xl">{formatCurrency(totalBudgeted)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contratado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold md:text-2xl">{formatCurrency(totalContracted)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-primary md:text-2xl">
            {formatCurrency(totalPaid)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falta Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-destructive md:text-2xl">
            {formatCurrency(totalRemaining)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
