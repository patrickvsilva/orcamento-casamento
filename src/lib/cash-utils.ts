export type IncomeAmounts = {
  amount: number;
  received_at: Date | string | null;
  expected_date?: Date | string | null;
};

export type CashInputs = {
  startingBalance: number;
  incomes: IncomeAmounts[];
  totalPaid: number;
  totalRemaining: number;
};

export type CashTotals = {
  receivedIncomes: number;
  pendingIncomes: number;
  cashOnHand: number;
  projected: number;
  coverage: number;
  totalRemaining: number;
};

export function computeCashTotals({
  startingBalance,
  incomes,
  totalPaid,
  totalRemaining,
}: CashInputs): CashTotals {
  let receivedIncomes = 0;
  let pendingIncomes = 0;

  for (const income of incomes) {
    if (income.received_at) {
      receivedIncomes += income.amount;
    } else {
      pendingIncomes += income.amount;
    }
  }

  const cashOnHand = startingBalance + receivedIncomes - totalPaid;
  const projected = cashOnHand + pendingIncomes;
  const coverage = projected - totalRemaining;

  return {
    receivedIncomes,
    pendingIncomes,
    cashOnHand,
    projected,
    coverage,
    totalRemaining,
  };
}

export function isCashCovered(coverage: number) {
  return coverage >= 0;
}

export function computeUpcomingDueRemaining(
  vendors: Array<{ next_due_date: Date | string | null; remaining: number }>,
) {
  return vendors
    .filter((vendor) => vendor.next_due_date && vendor.remaining > 0)
    .reduce((acc, vendor) => acc + vendor.remaining, 0);
}

export function splitIncomes<T extends IncomeAmounts>(incomes: T[]) {
  const pending: T[] = [];
  const received: T[] = [];

  for (const income of incomes) {
    if (income.received_at) {
      received.push(income);
    } else {
      pending.push(income);
    }
  }

  pending.sort((a, b) => {
    const aDate = a.expected_date;
    const bDate = b.expected_date;
    if (aDate && bDate) return new Date(aDate).getTime() - new Date(bDate).getTime();
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
  });

  received.sort((a, b) => {
    const aDate = a.received_at ? new Date(a.received_at).getTime() : 0;
    const bDate = b.received_at ? new Date(b.received_at).getTime() : 0;
    return bDate - aDate;
  });

  return { pending, received };
}
