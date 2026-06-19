import { z } from 'zod';
import { VENDOR_CATEGORIES, isVendorCategory } from '@/lib/constants';

export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  service: z.string().min(2, 'Serviço deve ter pelo menos 2 caracteres'),
  category: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .refine((value) => isVendorCategory(value), 'Categoria inválida'),
  budgeted_amount: z.coerce.number().min(0, 'Valor orçado inválido'),
  contracted_amount: z.coerce.number().nullable().optional(),
  paid_amount: z.coerce.number().min(0, 'Valor pago inválido').default(0),
  next_due_date: z.string().optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

export function parseDueDateInput(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const quickPaymentSchema = z.object({
  amount: z.coerce.number().positive('Informe um valor maior que zero'),
});

export type QuickPaymentData = z.infer<typeof quickPaymentSchema>;

export { VENDOR_CATEGORIES };
