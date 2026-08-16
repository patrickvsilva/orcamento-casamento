import { describe, expect, it } from 'vitest';
import {
  computeCashTotals,
  computeUpcomingDueRemaining,
  isCashCovered,
  splitIncomes,
} from '@/lib/cash-utils';

describe('cash totals', () => {
  it('computes cash on hand from starting balance, received incomes and paid amount', () => {
    const totals = computeCashTotals({
      startingBalance: 10000,
      incomes: [
        { amount: 2000, received_at: '2026-06-01' },
        { amount: 3000, received_at: null },
      ],
      totalPaid: 4000,
      totalRemaining: 8000,
    });

    expect(totals.receivedIncomes).toBe(2000);
    expect(totals.pendingIncomes).toBe(3000);
    expect(totals.cashOnHand).toBe(8000);
    expect(totals.projected).toBe(11000);
    expect(totals.coverage).toBe(3000);
  });

  it('detects a shortfall when projected cash does not cover remaining payments', () => {
    const totals = computeCashTotals({
      startingBalance: 1000,
      incomes: [{ amount: 500, received_at: null }],
      totalPaid: 0,
      totalRemaining: 4000,
    });

    expect(totals.coverage).toBe(-2500);
    expect(isCashCovered(totals.coverage)).toBe(false);
  });

  it('marks coverage as sufficient when projected cash meets remaining', () => {
    expect(isCashCovered(0)).toBe(true);
    expect(isCashCovered(10)).toBe(true);
  });
});

describe('upcoming dues', () => {
  it('sums remaining amounts only for vendors with a due date', () => {
    expect(
      computeUpcomingDueRemaining([
        { next_due_date: '2026-09-01', remaining: 1000 },
        { next_due_date: null, remaining: 5000 },
        { next_due_date: '2026-08-20', remaining: 0 },
        { next_due_date: '2026-10-01', remaining: 250 },
      ]),
    ).toBe(1250);
  });
});

describe('split incomes', () => {
  it('separates pending and received incomes', () => {
    const { pending, received } = splitIncomes([
      { amount: 100, received_at: null, expected_date: '2026-09-01' },
      { amount: 200, received_at: '2026-06-01', expected_date: null },
      { amount: 50, received_at: null, expected_date: null },
    ]);

    expect(pending.map((item) => item.amount)).toEqual([100, 50]);
    expect(received.map((item) => item.amount)).toEqual([200]);
  });
});
