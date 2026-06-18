import type { VendorAmounts } from '@/lib/vendor-status';
import { getVendorRemainingAmounts } from '@/lib/vendor-status';

export function validatePaymentAmount(vendor: VendorAmounts, amount: number) {
  const contracted = vendor.contracted_amount || 0;
  const remaining = getVendorRemainingAmounts(vendor);

  if (contracted <= 0) {
    throw new Error('Fornecedor sem valor contratado');
  }

  if (remaining <= 0) {
    throw new Error('Este fornecedor já está quitado');
  }

  if (amount > remaining + 0.009) {
    throw new Error('Valor maior que o saldo em aberto');
  }

  return Math.min(vendor.paid_amount + amount, contracted);
}
