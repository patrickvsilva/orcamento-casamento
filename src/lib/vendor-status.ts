export type VendorAmounts = {
  budgeted_amount: number;
  contracted_amount: number | null;
  paid_amount: number;
};

export function getVendorRemainingAmounts(vendor: VendorAmounts) {
  const contracted = vendor.contracted_amount || 0;
  return contracted - vendor.paid_amount;
}

export function isVendorFullyPaidAmounts(vendor: VendorAmounts) {
  const contracted = vendor.contracted_amount || 0;
  return contracted > 0 && getVendorRemainingAmounts(vendor) <= 0;
}

export function deriveCsvStatus(vendor: VendorAmounts): string {
  const contracted = vendor.contracted_amount || 0;
  const budgeted = vendor.budgeted_amount || 0;

  if (contracted <= 0) {
    return budgeted > 0 ? 'Orçado' : 'Verificar';
  }

  return vendor.paid_amount >= contracted ? 'Fechado' : 'Fechado';
}
