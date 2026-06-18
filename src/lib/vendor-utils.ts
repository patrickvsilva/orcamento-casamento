import { getVendors } from '@/app/actions';

import { getVendorRemainingAmounts, isVendorFullyPaidAmounts } from '@/lib/vendor-status';

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
  return getVendorRemainingAmounts(vendor);
}

export function isVendorFullyPaid(vendor: Vendor) {
  return isVendorFullyPaidAmounts(vendor);
}

export function computeBudgetTotals(vendors: Vendor[]) {
  const totalBudgeted = vendors.reduce((acc, v) => acc + v.budgeted_amount, 0);
  const totalContracted = vendors.reduce((acc, v) => acc + (v.contracted_amount || 0), 0);
  const totalPaid = vendors.reduce((acc, v) => acc + v.paid_amount, 0);
  const totalRemaining = totalContracted - totalPaid;

  return { totalBudgeted, totalContracted, totalPaid, totalRemaining };
}

export type CategorySpending = {
  category: string;
  amount: number;
  percentage: number;
};

export function computeCategorySpending(vendors: Vendor[]): CategorySpending[] {
  const totals = new Map<string, number>();

  for (const vendor of vendors) {
    if (vendor.paid_amount <= 0) continue;
    totals.set(vendor.category, (totals.get(vendor.category) ?? 0) + vendor.paid_amount);
  }

  const totalPaid = [...totals.values()].reduce((acc, amount) => acc + amount, 0);
  if (totalPaid <= 0) return [];

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalPaid) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}
