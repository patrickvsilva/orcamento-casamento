import { describe, expect, it } from 'vitest';
import {
  deriveCsvStatus,
  getVendorRemainingAmounts,
  isVendorFullyPaidAmounts,
} from '@/lib/vendor-status';

describe('vendor status helpers', () => {
  it('calculates remaining amount', () => {
    expect(
      getVendorRemainingAmounts({
        budgeted_amount: 1000,
        contracted_amount: 800,
        paid_amount: 300,
      }),
    ).toBe(500);
  });

  it('detects fully paid vendor', () => {
    expect(
      isVendorFullyPaidAmounts({
        budgeted_amount: 1000,
        contracted_amount: 800,
        paid_amount: 800,
      }),
    ).toBe(true);
  });

  it('does not mark budget-only vendor as paid', () => {
    expect(
      isVendorFullyPaidAmounts({
        budgeted_amount: 1000,
        contracted_amount: null,
        paid_amount: 0,
      }),
    ).toBe(false);
  });

  it('derives CSV status labels', () => {
    expect(
      deriveCsvStatus({
        budgeted_amount: 1000,
        contracted_amount: null,
        paid_amount: 0,
      }),
    ).toBe('Orçado');

    expect(
      deriveCsvStatus({
        budgeted_amount: 1000,
        contracted_amount: 800,
        paid_amount: 800,
      }),
    ).toBe('Fechado');
  });
});
