'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deleteVendor } from '@/app/actions';
import { toast } from 'sonner';
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

interface DeleteVendorButtonProps {
  id: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  label?: string;
  onSuccess?: () => void;
}

export function DeleteVendorButton({
  id,
  className,
  variant = 'destructive',
  size = 'sm',
  label = 'Excluir',
  onSuccess,
}: DeleteVendorButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        await deleteVendor(id);
        toast.success('Fornecedor excluído com sucesso!');
        setOpen(false);
        onSuccess?.();
      } catch {
        toast.error('Erro ao excluir fornecedor.');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant={variant} size={size} className={className} disabled={isPending}>
            {isPending ? 'Excluindo...' : label}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O fornecedor será removido permanentemente do
            orçamento.
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
