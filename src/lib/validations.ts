import { z } from 'zod';

export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  service: z.string().min(2, 'Serviço deve ter pelo menos 2 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  budgeted_amount: z.coerce.number().min(0, 'Valor orçado inválido'),
  contracted_amount: z.coerce.number().nullable().optional(),
  paid_amount: z.coerce.number().min(0, 'Valor pago inválido').default(0),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
