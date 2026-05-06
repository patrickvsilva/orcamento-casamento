"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, VendorFormData } from "@/lib/validations";
import { VENDOR_CATEGORIES } from "@/lib/constants";
import { createVendor, updateVendor } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Vendor = VendorFormData & { id?: string };

interface VendorFormProps {
  vendor?: Vendor;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function VendorForm({ vendor, trigger, onSuccess }: VendorFormProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!vendor?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema) as any,
    defaultValues: {
      name: vendor?.name || "",
      service: vendor?.service || "",
      category: vendor?.category || "",
      budgeted_amount: vendor?.budgeted_amount || 0,
      contracted_amount: vendor?.contracted_amount || null,
      paid_amount: vendor?.paid_amount || 0,
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (isEditing && vendor.id) {
        await updateVendor(vendor.id, data);
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        await createVendor(data);
        toast.success("Fornecedor criado com sucesso!");
      }
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar fornecedor");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger || <Button>Adicionar Fornecedor</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} placeholder="Ex: João Fotografia" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Serviço</Label>
            <Input id="service" {...register("service")} placeholder="Ex: Fotografia e Filmagem" />
            {errors.service && <p className="text-sm text-destructive">{errors.service.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={watch("category")} 
              onValueChange={(val) => setValue("category", val)}
            >
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
              <Input 
                id="budgeted_amount" 
                type="number" 
                step="0.01" 
                {...register("budgeted_amount")} 
              />
              {errors.budgeted_amount && <p className="text-sm text-destructive">{errors.budgeted_amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contracted_amount">Valor Contratado</Label>
              <Input 
                id="contracted_amount" 
                type="number" 
                step="0.01" 
                {...register("contracted_amount")} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid_amount">Valor Pago</Label>
            <Input 
              id="paid_amount" 
              type="number" 
              step="0.01" 
              {...register("paid_amount")} 
            />
            {errors.paid_amount && <p className="text-sm text-destructive">{errors.paid_amount.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
