'use client';

import { useRouter } from 'next/navigation';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startingBalanceSchema, StartingBalanceData } from '@/lib/validations';
import { updateStartingBalance } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface StartingBalanceFormProps {
  startingBalance: number;
}

export function StartingBalanceForm({ startingBalance }: StartingBalanceFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StartingBalanceData>({
    resolver: zodResolver(startingBalanceSchema) as Resolver<StartingBalanceData>,
    defaultValues: { starting_balance: startingBalance },
  });

  const onSubmit = async (data: StartingBalanceData) => {
    try {
      await updateStartingBalance(data.starting_balance);
      toast.success('Saldo inicial atualizado!');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar saldo inicial');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="starting_balance">Saldo inicial</Label>
        <Input
          id="starting_balance"
          type="number"
          step="0.01"
          min="0"
          {...register('starting_balance')}
        />
        {errors.starting_balance && (
          <p className="text-sm text-destructive">{errors.starting_balance.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Dinheiro já separado para o casamento. Pagamentos de fornecedores saem deste caixa
          automaticamente.
        </p>
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar saldo inicial'}
      </Button>
    </form>
  );
}
