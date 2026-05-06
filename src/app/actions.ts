"use server";

import { prisma } from "@/lib/db";
import { vendorSchema, VendorFormData } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getVendors(filters?: { status?: string; category?: string }) {
  try {
    const where: any = {};
    if (filters?.category && filters.category !== "all") {
      where.category = filters.category;
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    
    // Convert Decimal to number for the UI
    let parsedVendors = vendors.map(v => ({
      ...v,
      budgeted_amount: Number(v.budgeted_amount),
      contracted_amount: v.contracted_amount ? Number(v.contracted_amount) : null,
      paid_amount: Number(v.paid_amount),
    }));

    if (filters?.status && filters.status !== "all") {
      parsedVendors = parsedVendors.filter(v => {
        const contracted = v.contracted_amount || 0;
        const remaining = contracted - v.paid_amount;
        const isPaid = contracted > 0 && remaining <= 0;
        if (filters.status === "paid") return isPaid;
        if (filters.status === "pending") return !isPaid;
        return true;
      });
    }

    return parsedVendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw new Error("Erro ao buscar fornecedores");
  }
}

export async function createVendor(data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);
  
  if (!parsed.success) {
    throw new Error("Dados inválidos");
  }

  try {
    await prisma.vendor.create({
      data: {
        name: parsed.data.name,
        service: parsed.data.service,
        category: parsed.data.category,
        budgeted_amount: parsed.data.budgeted_amount,
        contracted_amount: parsed.data.contracted_amount,
        paid_amount: parsed.data.paid_amount,
      },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw new Error("Erro ao criar fornecedor");
  }
}

export async function updateVendor(id: string, data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);
  
  if (!parsed.success) {
    throw new Error("Dados inválidos");
  }

  try {
    await prisma.vendor.update({
      where: { id },
      data: {
        name: parsed.data.name,
        service: parsed.data.service,
        category: parsed.data.category,
        budgeted_amount: parsed.data.budgeted_amount,
        contracted_amount: parsed.data.contracted_amount,
        paid_amount: parsed.data.paid_amount,
      },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating vendor:", error);
    throw new Error("Erro ao atualizar fornecedor");
  }
}

export async function deleteVendor(id: string) {
  try {
    await prisma.vendor.delete({
      where: { id },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vendor:", error);
    throw new Error("Erro ao deletar fornecedor");
  }
}
