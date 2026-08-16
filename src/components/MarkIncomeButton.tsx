'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { markIncomeReceived, unmarkIncomeReceived } from '@/app/actions';
import { toast } from 'sonner';
import { triggerHaptic } from '@/hooks/use-haptic';

interface MarkIncomeButtonProps {
  id: string;
  received: boolean;
}

export function MarkIncomeButton({ id, received }: MarkIncomeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        if (received) {
          await unmarkIncomeReceived(id);
          toast.success('Receita marcada como a entrar');
        } else {
          await markIncomeReceived(id);
          triggerHaptic(10);
          toast.success('Receita marcada como recebida');
        }
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar receita');
      }
    });
  };

  return (
    <Button
      type="button"
      variant={received ? 'outline' : 'default'}
      size="sm"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? 'Salvando...' : received ? 'Desmarcar' : 'Marcar recebida'}
    </Button>
  );
}
