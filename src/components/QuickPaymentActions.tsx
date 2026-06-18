'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quickPaymentSchema, QuickPaymentData } from '@/lib/validations';
import { recordVendorPayment } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/use-haptic';
import { toast } from 'sonner';

interface QuickPaymentActionsProps {
  vendorId: string;
  vendorName: string;
  remaining: number;
}

function PartialPaymentForm({
  vendorId,
  remaining,
  onSuccess,
  onCancel,
}: {
  vendorId: string;
  remaining: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuickPaymentData>({
    resolver: zodResolver(quickPaymentSchema) as Resolver<QuickPaymentData>,
    defaultValues: { amount: remaining },
  });

  const onSubmit = async (data: QuickPaymentData) => {
    try {
      await recordVendorPayment(vendorId, data.amount);
      triggerHaptic(10);
      toast.success(`Pagamento de ${formatCurrency(data.amount)} registrado!`);
      router.refresh();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar pagamento');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Saldo em aberto:{' '}
        <span className="font-medium text-foreground">{formatCurrency(remaining)}</span>
      </p>

      <div className="space-y-2">
        <Label htmlFor={`amount-${vendorId}`}>Valor do pagamento</Label>
        <Input
          id={`amount-${vendorId}`}
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          {...register('amount')}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setValue('amount', remaining, { shouldValidate: true })}
      >
        Usar saldo total ({formatCurrency(remaining)})
      </Button>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}

function PartialPaymentDialog({
  vendorId,
  vendorName,
  remaining,
  open,
  onOpenChange,
}: {
  vendorId: string;
  vendorName: string;
  remaining: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const form = (
    <PartialPaymentForm
      vendorId={vendorId}
      remaining={remaining}
      onSuccess={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Pagamento parcial</SheetTitle>
          </SheetHeader>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Pagamento parcial — {vendorName}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}

export function QuickPaymentActions({ vendorId, vendorName, remaining }: QuickPaymentActionsProps) {
  const router = useRouter();
  const [partialOpen, setPartialOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const payRemaining = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        await recordVendorPayment(vendorId, remaining);
        triggerHaptic([10, 20, 10]);
        toast.success(`${vendorName} quitado — ${formatCurrency(remaining)} registrado!`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao registrar pagamento');
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={isPending} onClick={payRemaining}>
          {isPending ? 'Registrando...' : 'Quitar saldo'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isPending}
          onClick={() => setPartialOpen(true)}
        >
          Outro valor
        </Button>
      </div>

      <PartialPaymentDialog
        vendorId={vendorId}
        vendorName={vendorName}
        remaining={remaining}
        open={partialOpen}
        onOpenChange={setPartialOpen}
      />
    </>
  );
}
