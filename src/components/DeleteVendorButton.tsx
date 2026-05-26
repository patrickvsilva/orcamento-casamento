"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteVendor } from "@/app/actions";
import { toast } from "sonner";

interface DeleteVendorButtonProps {
  id: string;
  className?: string;
}

export function DeleteVendorButton({ id, className }: DeleteVendorButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      startTransition(async () => {
        try {
          await deleteVendor(id);
          toast.success("Fornecedor excluído com sucesso!");
        } catch (error) {
          toast.error("Erro ao excluir fornecedor.");
        }
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
