'use server';

import { prisma } from '@/lib/db';
import {
  vendorSchema,
  VendorFormData,
  quickPaymentSchema,
  parseDueDateInput,
  incomeSchema,
  IncomeFormData,
  startingBalanceSchema,
} from '@/lib/validations';
import { findVendors } from '@/lib/vendor-repository';
import {
  findIncomes,
  getOrCreateCashSettings,
  upsertStartingBalance,
} from '@/lib/cash-repository';
import { validatePaymentAmount } from '@/lib/vendor-payment';
import { revalidatePath } from 'next/cache';

function revalidateVendorPages() {
  revalidatePath('/');
  revalidatePath('/fornecedores');
  revalidatePath('/pendencias');
  revalidatePath('/mais');
  revalidatePath('/caixa');
}

export async function getVendors(filters?: Parameters<typeof findVendors>[0]) {
  try {
    return await findVendors(filters);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Erro ao buscar fornecedores');
  }
}

export async function createVendor(data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  try {
    await prisma.vendor.create({
      data: {
        name: parsed.data.name,
        service: parsed.data.service,
        category: parsed.data.category,
        budgeted_amount: parsed.data.budgeted_amount,
        contracted_amount: parsed.data.contracted_amount,
        paid_amount: parsed.data.paid_amount,
        next_due_date: parseDueDateInput(parsed.data.next_due_date),
      },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw new Error('Erro ao criar fornecedor');
  }
}

export async function updateVendor(id: string, data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  try {
    await prisma.vendor.update({
      where: { id },
      data: {
        name: parsed.data.name,
        service: parsed.data.service,
        category: parsed.data.category,
        budgeted_amount: parsed.data.budgeted_amount,
        contracted_amount: parsed.data.contracted_amount,
        paid_amount: parsed.data.paid_amount,
        next_due_date: parseDueDateInput(parsed.data.next_due_date),
      },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw new Error('Erro ao atualizar fornecedor');
  }
}

export async function deleteVendor(id: string) {
  try {
    await prisma.vendor.delete({
      where: { id },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw new Error('Erro ao deletar fornecedor');
  }
}

export async function recordVendorPayment(vendorId: string, amount: number) {
  const parsed = quickPaymentSchema.safeParse({ amount });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Valor inválido');
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error('Fornecedor não encontrado');
    }

    const amounts = {
      budgeted_amount: Number(vendor.budgeted_amount),
      contracted_amount: vendor.contracted_amount ? Number(vendor.contracted_amount) : null,
      paid_amount: Number(vendor.paid_amount),
    };

    const newPaid = validatePaymentAmount(amounts, parsed.data.amount);

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { paid_amount: newPaid },
    });

    revalidateVendorPages();
    return { success: true, paid_amount: newPaid };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error recording payment:', error);
    throw new Error('Erro ao registrar pagamento');
  }
}

export async function getCashSettings() {
  try {
    return await getOrCreateCashSettings();
  } catch (error) {
    console.error('Error fetching cash settings:', error);
    throw new Error('Erro ao buscar o caixa');
  }
}

export async function updateStartingBalance(amount: number) {
  const parsed = startingBalanceSchema.safeParse({ starting_balance: amount });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Saldo inicial inválido');
  }

  try {
    const settings = await upsertStartingBalance(parsed.data.starting_balance);
    revalidateVendorPages();
    return { success: true, starting_balance: settings.starting_balance };
  } catch (error) {
    console.error('Error updating starting balance:', error);
    throw new Error('Erro ao atualizar o saldo inicial');
  }
}

export async function getIncomes() {
  try {
    return await findIncomes();
  } catch (error) {
    console.error('Error fetching incomes:', error);
    throw new Error('Erro ao buscar receitas');
  }
}

export async function createIncome(data: IncomeFormData) {
  const parsed = incomeSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  try {
    await prisma.income.create({
      data: {
        description: parsed.data.description,
        amount: parsed.data.amount,
        expected_date: parseDueDateInput(parsed.data.expected_date),
      },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error creating income:', error);
    throw new Error('Erro ao criar receita');
  }
}

export async function updateIncome(id: string, data: IncomeFormData) {
  const parsed = incomeSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  try {
    await prisma.income.update({
      where: { id },
      data: {
        description: parsed.data.description,
        amount: parsed.data.amount,
        expected_date: parseDueDateInput(parsed.data.expected_date),
      },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error updating income:', error);
    throw new Error('Erro ao atualizar receita');
  }
}

export async function deleteIncome(id: string) {
  try {
    await prisma.income.delete({
      where: { id },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error deleting income:', error);
    throw new Error('Erro ao excluir receita');
  }
}

export async function markIncomeReceived(id: string) {
  try {
    await prisma.income.update({
      where: { id },
      data: { received_at: new Date() },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error marking income received:', error);
    throw new Error('Erro ao marcar receita como recebida');
  }
}

export async function unmarkIncomeReceived(id: string) {
  try {
    await prisma.income.update({
      where: { id },
      data: { received_at: null },
    });

    revalidateVendorPages();
    return { success: true };
  } catch (error) {
    console.error('Error unmarking income received:', error);
    throw new Error('Erro ao desmarcar receita');
  }
}
