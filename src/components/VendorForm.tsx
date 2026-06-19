'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VendorFormData } from '@/lib/validations';
import { VENDOR_CATEGORIES, normalizeCategory } from '@/lib/constants';
import { createVendor, updateVendor } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { toDateInputValue } from '@/lib/utils';

type VendorInput = {
  id?: string;
  name?: string;
  service?: string;
  category?: string;
  budgeted_amount?: number;
  contracted_amount?: number | null;
  paid_amount?: number;
  next_due_date?: Date | string | null;
};

interface VendorFormProps {
  vendor?: VendorInput;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

function VendorFormFields({
  register,
  errors,
  categoryValue,
  setValue,
  isSubmitting,
  isEditing,
}: {
  register: ReturnType<typeof useForm<VendorFormData>>['register'];
  errors: ReturnType<typeof useForm<VendorFormData>>['formState']['errors'];
  categoryValue: string | undefined;
  setValue: ReturnType<typeof useForm<VendorFormData>>['setValue'];
  isSubmitting: boolean;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} placeholder="Ex: João Fotografia" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="service">Serviço</Label>
        <Input id="service" {...register('service')} placeholder="Ex: Fotografia e Filmagem" />
        {errors.service && <p className="text-sm text-destructive">{errors.service.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select value={categoryValue} onValueChange={(val) => setValue('category', val || '')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {VENDOR_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budgeted_amount">Valor Orçado</Label>
          <Input id="budgeted_amount" type="number" step="0.01" {...register('budgeted_amount')} />
          {errors.budgeted_amount && (
            <p className="text-sm text-destructive">{errors.budgeted_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contracted_amount">Valor Contratado</Label>
          <Input
            id="contracted_amount"
            type="number"
            step="0.01"
            {...register('contracted_amount')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paid_amount">Valor Pago</Label>
        <Input id="paid_amount" type="number" step="0.01" {...register('paid_amount')} />
        {errors.paid_amount && (
          <p className="text-sm text-destructive">{errors.paid_amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_due_date">Próximo vencimento</Label>
        <Input id="next_due_date" type="date" {...register('next_due_date')} />
        {errors.next_due_date && (
          <p className="text-sm text-destructive">{errors.next_due_date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar'}
      </Button>
    </div>
  );
}

export function VendorForm({
  vendor,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: VendorFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const isEditing = !!vendor?.id;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema) as Resolver<VendorFormData>,
    defaultValues: {
      name: vendor?.name || '',
      service: vendor?.service || '',
      category: (vendor?.category ? normalizeCategory(vendor.category, vendor.name) : '') as string,
      budgeted_amount: vendor?.budgeted_amount || 0,
      contracted_amount: vendor?.contracted_amount || null,
      paid_amount: vendor?.paid_amount || 0,
      next_due_date: toDateInputValue(vendor?.next_due_date),
    },
  });

  const categoryValue = useWatch({
    control,
    name: 'category',
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (isEditing && vendor?.id) {
        await updateVendor(vendor.id, data);
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await createVendor(data);
        toast.success('Fornecedor criado com sucesso!');
      }
      setOpen(false);
      reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar fornecedor');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) reset();
  };

  const title = isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor';
  const defaultTrigger = <Button>Adicionar Fornecedor</Button>;

  const form = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VendorFormFields
        register={register}
        errors={errors}
        categoryValue={categoryValue}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {!hideTrigger && (
          <SheetTrigger render={trigger || defaultTrigger} />
        )}
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && <DialogTrigger render={trigger || defaultTrigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
