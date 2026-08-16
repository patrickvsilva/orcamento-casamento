import { prisma } from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';

export const CASH_SETTINGS_ID = 'default';

export type CashSettingsRecord = {
  id: string;
  starting_balance: number;
  updated_at: Date;
};

export type IncomeRecord = {
  id: string;
  description: string;
  amount: number;
  expected_date: Date | null;
  received_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function mapCashSettings(settings: {
  id: string;
  starting_balance: Prisma.Decimal;
  updated_at: Date;
}): CashSettingsRecord {
  return {
    id: settings.id,
    starting_balance: Number(settings.starting_balance),
    updated_at: settings.updated_at,
  };
}

function mapIncome(income: {
  id: string;
  description: string;
  amount: Prisma.Decimal;
  expected_date: Date | null;
  received_at: Date | null;
  created_at: Date;
  updated_at: Date;
}): IncomeRecord {
  return {
    ...income,
    amount: Number(income.amount),
  };
}

export async function getOrCreateCashSettings(): Promise<CashSettingsRecord> {
  const existing = await prisma.cashSettings.findUnique({
    where: { id: CASH_SETTINGS_ID },
  });

  if (existing) {
    return mapCashSettings(existing);
  }

  const created = await prisma.cashSettings.create({
    data: { id: CASH_SETTINGS_ID, starting_balance: 0 },
  });

  return mapCashSettings(created);
}

export async function upsertStartingBalance(amount: number): Promise<CashSettingsRecord> {
  const settings = await prisma.cashSettings.upsert({
    where: { id: CASH_SETTINGS_ID },
    create: { id: CASH_SETTINGS_ID, starting_balance: amount },
    update: { starting_balance: amount },
  });

  return mapCashSettings(settings);
}

export async function findIncomes(): Promise<IncomeRecord[]> {
  const incomes = await prisma.income.findMany({
    orderBy: [{ expected_date: { sort: 'asc', nulls: 'last' } }, { created_at: 'desc' }],
  });

  return incomes.map(mapIncome);
}
