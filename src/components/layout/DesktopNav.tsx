'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { VendorForm } from '@/components/VendorForm';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Resumo' },
  { href: '/fornecedores', label: 'Fornecedores' },
  { href: '/pendencias', label: 'Pendências' },
  { href: '/mais', label: 'Mais' },
] as const;

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b bg-card md:block">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Orçamento do Casamento
          </Link>
          <nav className="flex items-center gap-1" aria-label="Navegação principal">
            {links.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <VendorForm trigger={<Button>Adicionar Fornecedor</Button>} />
      </div>
    </header>
  );
}
