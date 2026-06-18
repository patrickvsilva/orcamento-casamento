'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { VENDOR_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pago' },
  { value: 'pending', label: 'Falta pagar' },
] as const;

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className={cn('shrink-0 rounded-full', active && 'shadow-sm')}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function VendorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentStatus = searchParams.get('status') || 'all';

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip
          label="Todas"
          active={currentCategory === 'all'}
          onClick={() => updateFilters('category', 'all')}
        />
        {VENDOR_CATEGORIES.map((category) => (
          <FilterChip
            key={category}
            label={category}
            active={currentCategory === category}
            onClick={() => updateFilters('category', category)}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={currentStatus === option.value}
            onClick={() => updateFilters('status', option.value)}
          />
        ))}
      </div>

      <div className="hidden gap-2 md:flex md:items-center">
        <Select value={currentCategory} onValueChange={(val) => updateFilters('category', val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {VENDOR_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentStatus} onValueChange={(val) => updateFilters('status', val)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
