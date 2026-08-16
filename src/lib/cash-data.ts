import { getCashSettings, getIncomes } from '@/app/actions';
import {
  computeCashTotals,
  computeUpcomingDueRemaining,
  type CashTotals,
  type IncomeAmounts,
} from '@/lib/cash-utils';
import { computeBudgetTotals, getVendorRemaining, type Vendor } from '@/lib/vendor-utils';

export type CashSnapshot = CashTotals & {
  startingBalance: number;
  upcomingDueRemaining: number;
};

export async function fetchCashData() {
  try {
    const [settings, incomes] = await Promise.all([getCashSettings(), getIncomes()]);
    return { settings, incomes };
  } catch {
    console.warn('DB not connected yet');
    return {
      settings: { id: 'default', starting_balance: 0, updated_at: new Date() },
      incomes: [] as Awaited<ReturnType<typeof getIncomes>>,
    };
  }
}

export function buildCashSnapshot(
  startingBalance: number,
  incomes: IncomeAmounts[],
  vendors: Vendor[],
): CashSnapshot {
  const { totalPaid, totalRemaining } = computeBudgetTotals(vendors);
  const totals = computeCashTotals({
    startingBalance,
    incomes,
    totalPaid,
    totalRemaining,
  });

  const upcomingDueRemaining = computeUpcomingDueRemaining(
    vendors.map((vendor) => ({
      next_due_date: vendor.next_due_date,
      remaining: getVendorRemaining(vendor),
    })),
  );

  return {
    ...totals,
    startingBalance,
    upcomingDueRemaining,
  };
}
