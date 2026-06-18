'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Home, List, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/hooks/use-haptic';
import { VendorForm } from '@/components/VendorForm';
import { Button } from '@/components/ui/button';

const tabs = [
  { href: '/', label: 'Resumo', icon: Home, match: (path: string) => path === '/' },
  {
    href: '/fornecedores',
    label: 'Fornecedores',
    icon: List,
    match: (path: string) => path.startsWith('/fornecedores'),
  },
  {
    href: '/pendencias',
    label: 'Pendências',
    icon: Clock,
    match: (path: string) => path.startsWith('/pendencias'),
  },
  {
    href: '/mais',
    label: 'Mais',
    icon: MoreHorizontal,
    match: (path: string) => path.startsWith('/mais'),
  },
] as const;

export function LiquidGlassTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-4 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegação principal"
    >
      <div className="liquid-glass mx-auto mb-3 flex max-w-lg items-end justify-around rounded-full px-2 py-2">
        {tabs.slice(0, 2).map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => triggerHaptic(6)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}

        <div className="flex flex-1 flex-col items-center -mt-4">
          <VendorForm
            trigger={
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg ring-4 ring-background"
                aria-label="Adicionar fornecedor"
              >
                <Plus className="h-6 w-6" />
              </Button>
            }
          />
        </div>

        {tabs.slice(2).map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => triggerHaptic(6)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
