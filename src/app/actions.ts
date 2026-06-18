'use server';

import { prisma } from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';
import { vendorSchema, VendorFormData, quickPaymentSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

function revalidateVendorPages() {
  revalidatePath('/');
  revalidatePath('/fornecedores');
  revalidatePath('/pendencias');
  revalidatePath('/mais');
}

export async function getVendors(filters?: {
  status?: string;
  category?: string;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}) {
  try {
    const where: Prisma.VendorWhereInput = {};
    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    const query = filters?.q?.trim();
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { service: { contains: query, mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal to number for the UI
    let parsedVendors = vendors.map((v) => ({
      ...v,
      budgeted_amount: Number(v.budgeted_amount),
      contracted_amount: v.contracted_amount ? Number(v.contracted_amount) : null,
      paid_amount: Number(v.paid_amount),
    }));

    if (filters?.status && filters.status !== 'all') {
      parsedVendors = parsedVendors.filter((v) => {
        const contracted = v.contracted_amount || 0;
        const remaining = contracted - v.paid_amount;
        const isPaid = contracted > 0 && remaining <= 0;
        if (filters.status === 'paid') return isPaid;
        if (filters.status === 'pending') return !isPaid;
        return true;
      });
    }

    if (filters?.sort) {
      parsedVendors.sort((a, b) => {
        let aVal: string | number | Date | null = a[filters.sort as keyof typeof a] as
          | string
          | number
          | Date
          | null;
        let bVal: string | number | Date | null = b[filters.sort as keyof typeof b] as
          | string
          | number
          | Date
          | null;

        if (filters.sort === 'remaining') {
          aVal = (a.contracted_amount || 0) - a.paid_amount;
          bVal = (b.contracted_amount || 0) - b.paid_amount;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comp = aVal.localeCompare(bVal);
          return filters.dir === 'desc' ? -comp : comp;
        }

        if (aVal === bVal) return 0;

        if (aVal instanceof Date && bVal instanceof Date) {
          const comp = aVal.getTime() - bVal.getTime();
          return filters.dir === 'desc' ? -comp : comp;
        }

        const aNum = typeof aVal === 'number' ? aVal : 0;
        const bNum = typeof bVal === 'number' ? bVal : 0;
        const comparison = aNum > bNum ? 1 : -1;
        return filters.dir === 'desc' ? -comparison : comparison;
      });
    }

    return parsedVendors;
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

    const contracted = vendor.contracted_amount ? Number(vendor.contracted_amount) : 0;
    const paid = Number(vendor.paid_amount);
    const remaining = contracted - paid;

    if (contracted <= 0) {
      throw new Error('Fornecedor sem valor contratado');
    }

    if (remaining <= 0) {
      throw new Error('Este fornecedor já está quitado');
    }

    if (parsed.data.amount > remaining + 0.009) {
      throw new Error('Valor maior que o saldo em aberto');
    }

    const newPaid = Math.min(paid + parsed.data.amount, contracted);

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
