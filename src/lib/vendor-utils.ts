import { getVendors } from '@/app/actions';

export type Vendor = Awaited<ReturnType<typeof getVendors>>[number];

export async function fetchVendors(filters?: Parameters<typeof getVendors>[0]) {
  try {
    return await getVendors(filters);
  } catch {
    console.warn('DB not connected yet');
    return [];
  }
}

export function getVendorRemaining(vendor: Vendor) {
  const contracted = vendor.contracted_amount || 0;
  return contracted - vendor.paid_amount;
}

export function isVendorFullyPaid(vendor: Vendor) {
  const contracted = vendor.contracted_amount || 0;
  return contracted > 0 && getVendorRemaining(vendor) <= 0;
}

export function computeBudgetTotals(vendors: Vendor[]) {
  const totalBudgeted = vendors.reduce((acc, v) => acc + v.budgeted_amount, 0);
  const totalContracted = vendors.reduce((acc, v) => acc + (v.contracted_amount || 0), 0);
  const totalPaid = vendors.reduce((acc, v) => acc + v.paid_amount, 0);
  const totalRemaining = totalContracted - totalPaid;

  return { totalBudgeted, totalContracted, totalPaid, totalRemaining };
}
