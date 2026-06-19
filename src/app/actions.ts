'use server';

import { prisma } from '@/lib/db';
import { vendorSchema, VendorFormData, quickPaymentSchema, parseDueDateInput } from '@/lib/validations';
import { findVendors } from '@/lib/vendor-repository';
import { validatePaymentAmount } from '@/lib/vendor-payment';
import { revalidatePath } from 'next/cache';

function revalidateVendorPages() {
  revalidatePath('/');
  revalidatePath('/fornecedores');
  revalidatePath('/pendencias');
  revalidatePath('/mais');
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
