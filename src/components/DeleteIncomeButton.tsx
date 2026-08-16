'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteIncome } from '@/app/actions';
import { toast } from 'sonner';
import { triggerHaptic } from '@/hooks/use-haptic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteIncomeButtonProps {
  id: string;
  className?: string;
}

export function DeleteIncomeButton({ id, className }: DeleteIncomeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        await deleteIncome(id);
        triggerHaptic([8, 16]);
        toast.success('Receita excluída com sucesso!');
        setOpen(false);
        router.refresh();
      } catch {
        toast.error('Erro ao excluir receita.');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={className}
            disabled={isPending}
            aria-label="Excluir receita"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A receita será removida do caixa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            {isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
