"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VENDOR_CATEGORIES } from "@/lib/constants";

export function VendorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 sm:flex-initial gap-2 items-center w-full sm:w-auto">
      <Select value={currentCategory} onValueChange={(val) => updateFilters("category", val)}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {VENDOR_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentStatus} onValueChange={(val) => updateFilters("status", val)}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="paid">Pago</SelectItem>
          <SelectItem value="pending">Falta Pagar</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
