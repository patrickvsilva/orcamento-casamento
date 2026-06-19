import { describe, expect, it } from 'vitest';
import { validatePaymentAmount } from '@/lib/vendor-payment';

const vendor = {
  budgeted_amount: 1000,
  contracted_amount: 500,
  paid_amount: 200,
};

describe('validatePaymentAmount', () => {
  it('adds partial payment up to contracted amount', () => {
    expect(validatePaymentAmount(vendor, 100)).toBe(300);
  });

  it('quits remaining balance', () => {
    expect(validatePaymentAmount(vendor, 300)).toBe(500);
  });

  it('rejects payment above remaining balance', () => {
    expect(() => validatePaymentAmount(vendor, 301)).toThrow('Valor maior que o saldo em aberto');
  });

  it('rejects payment without contracted amount', () => {
    expect(() =>
      validatePaymentAmount(
        { budgeted_amount: 1000, contracted_amount: null, paid_amount: 0 },
        100,
      ),
    ).toThrow('Fornecedor sem valor contratado');
  });
});
