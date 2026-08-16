'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSchema, IncomeFormData } from '@/lib/validations';
import { createIncome, updateIncome } from '@/app/actions';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { toDateInputValue } from '@/lib/utils';

type IncomeInput = {
  id?: string;
  description?: string;
  amount?: number;
  expected_date?: Date | string | null;
};

interface IncomeFormProps {
  income?: IncomeInput;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

function IncomeFormFields({
  register,
  errors,
  isSubmitting,
  isEditing,
}: {
  register: ReturnType<typeof useForm<IncomeFormData>>['register'];
  errors: ReturnType<typeof useForm<IncomeFormData>>['formState']['errors'];
  isSubmitting: boolean;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" {...register('description')} placeholder="Ex: Salário de agosto" />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Input id="amount" type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expected_date">Previsão de entrada</Label>
        <Input id="expected_date" type="date" {...register('expected_date')} />
        {errors.expected_date && (
          <p className="text-sm text-destructive">{errors.expected_date.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar'}
      </Button>
    </div>
  );
}

export function IncomeForm({ income, trigger, onSuccess }: IncomeFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const isEditing = !!income?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema) as Resolver<IncomeFormData>,
    defaultValues: {
      description: income?.description || '',
      amount: income?.amount || 0,
      expected_date: toDateInputValue(income?.expected_date),
    },
  });

  const onSubmit = async (data: IncomeFormData) => {
    try {
      if (isEditing && income?.id) {
        await updateIncome(income.id, data);
        toast.success('Receita atualizada com sucesso!');
      } else {
        await createIncome(data);
        toast.success('Receita criada com sucesso!');
      }
      setOpen(false);
      reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar receita');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) reset();
  };

  const title = isEditing ? 'Editar receita' : 'Nova receita';
  const defaultTrigger = <Button>Adicionar receita</Button>;

  const form = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IncomeFormFields
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger render={trigger || defaultTrigger} />
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
      <DialogTrigger render={trigger || defaultTrigger} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
