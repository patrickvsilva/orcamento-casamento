import { QuickPaymentActions } from '@/components/QuickPaymentActions';
import { DeleteVendorButton } from '@/components/DeleteVendorButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  computeBudgetTotals,
  fetchVendors,
  getVendorRemaining,
  isVendorFullyPaid,
} from '@/lib/vendor-utils';
import { formatCurrency } from '@/lib/utils';

export default async function PendenciasPage() {
  const vendors = await fetchVendors();
  const pendingVendors = vendors
    .filter((v) => !isVendorFullyPaid(v) && (v.contracted_amount || 0) > 0)
    .sort((a, b) => getVendorRemaining(b) - getVendorRemaining(a));

  const { totalRemaining } = computeBudgetTotals(vendors);

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pendências</h1>
        <p className="text-sm text-muted-foreground">Pagamentos ainda em aberto</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total em aberto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive md:text-3xl">
            {formatCurrency(totalRemaining)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingVendors.length}{' '}
            {pendingVendors.length === 1 ? 'fornecedor pendente' : 'fornecedores pendentes'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {pendingVendors.length === 0 ? (
          <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground">
            Tudo em dia! Nenhum pagamento pendente.
          </div>
        ) : (
          pendingVendors.map((vendor) => {
            const remaining = getVendorRemaining(vendor);
            const contracted = vendor.contracted_amount || 0;
            const paidPercent = contracted > 0 ? Math.round((vendor.paid_amount / contracted) * 100) : 0;

            return (
              <div key={vendor.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.service}</p>
                    <Badge variant="outline" className="mt-2">
                      {vendor.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">{formatCurrency(remaining)}</p>
                    <p className="text-xs text-muted-foreground">{paidPercent}% pago</p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>

                <div className="mt-3 space-y-2">
                  <QuickPaymentActions
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                    remaining={remaining}
                  />
                  <DeleteVendorButton id={vendor.id} className="w-full" variant="outline" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
