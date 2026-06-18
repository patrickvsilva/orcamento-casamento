'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function VendorSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [value, setValue] = useState(queryFromUrl);

  useEffect(() => {
    setValue(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();

      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      const next = params.toString();
      const current = searchParams.toString();
      if (next !== current) {
        router.replace(next ? `${pathname}?${next}` : pathname);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar fornecedor..."
        className="pr-9 pl-9"
        aria-label="Buscar fornecedor por nome"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setValue('')}
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
